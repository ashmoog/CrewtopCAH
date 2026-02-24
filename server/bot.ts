import { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from "discord.js";
import { storage } from "./storage";
import { db } from "./db";
import { playedCards as playedCardsTable } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const HAND_SIZE = 10;
const ROUND_TIMEOUT = 60_000;
const ROUND_BREAK = 5_000;

function prettyBlanks(text: string): string {
  return text.replace(/_+/g, "⬜⬜⬜⬜⬜");
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PickUIState {
  gameId: number;
  playerId: number;
  interaction: any;
  hand: { id: number; text: string; handId: number }[];
  pickCount: number;
  selectedIdxs: number[];
  ended: boolean;
  collector: any;
}
const pickUIs = new Map<string, PickUIState>();

function pickUIKey(guildId: string, channelId: string, userId: string): string {
  return `${guildId}:${channelId}:${userId}`;
}

function renderHandEmbed(hand: { text: string }[], selectedIdxs: number[], pickCount: number, blackCardText: string) {
  const lines = hand.map((c, i) => {
    const shown = selectedIdxs.includes(i) ? `~~${c.text}~~` : c.text;
    return `**${i + 1}.** ${shown}`;
  });

  return new EmbedBuilder()
    .setTitle(prettyBlanks(blackCardText))
    .setDescription(lines.join("\n"))
    .setFooter({ text: `Type ONE number per message (e.g. "1"). Selected: ${selectedIdxs.length}/${pickCount}. Type "reset" to start over.` })
    .setColor(0x2F3136);
}

function parseSinglePick(content: string, handSize: number): { kind: string; idx?: number; n?: number } {
  const c = content.trim().toLowerCase();
  if (!c) return { kind: "ignore" };
  if (c === "reset") return { kind: "reset" };

  const match = c.match(/\d+/);
  if (!match) return { kind: "ignore" };

  const n = Number(match[0]);
  if (!Number.isInteger(n)) return { kind: "invalid" };

  const idx = n - 1;
  if (idx < 0 || idx >= handSize) return { kind: "out_of_range", n };

  return { kind: "pick", idx, n };
}

const roundTimers: Map<number, NodeJS.Timeout> = new Map();
const endedGames = new Set<number>();
const activeTransitions = new Set<number>();
const judgeViewMap: Map<number, number[]> = new Map();

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clearRoundTimer(gameId: number) {
  const existing = roundTimers.get(gameId);
  if (existing) {
    clearTimeout(existing);
    roundTimers.delete(gameId);
  }
}

async function endGame(channel: any, gameId: number, winnerId?: number, reason?: string) {
  if (endedGames.has(gameId)) return;
  endedGames.add(gameId);

  clearRoundTimer(gameId);
  activeTransitions.delete(gameId);

  const keysToDelete: string[] = [];
  pickUIs.forEach((state, key) => {
    if (state.gameId === gameId) {
      state.ended = true;
      if (state.collector && !state.collector.ended) state.collector.stop("game_ended");
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(k => pickUIs.delete(k));

  const players = await storage.getPlayers(gameId);
  const scoresText = players
    .sort((a: any, b: any) => b.score - a.score)
    .map((p: any) => `<@${p.userId}>: ${p.score ?? 0}`)
    .join("\n") || "No scores recorded.";

  const winner = winnerId ? players.find((p: any) => p.id === winnerId) : null;

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("GAME OVER")
        .setDescription(
          winner
            ? `<@${winner.userId}> wins the game with **${winner.score ?? 0}** point(s)!`
            : (reason || "The game has been ended.")
        )
        .addFields({ name: "Final Scores:", value: scoresText })
        .setFooter({ text: "Thanks for playing! Use /startgame to play again." })
        .setColor(winner ? 0xFFD700 : 0xFF0000)
    ]
  });

  judgeViewMap.delete(gameId);
  await storage.updateGameStatus(gameId, "finished").catch(e => console.error("Failed to update game status:", e));
  await storage.deleteGame(gameId).catch(e => console.error("Failed to delete game from DB:", e));

  setTimeout(() => endedGames.delete(gameId), 30000);
}

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help for the Cards Against Humanity bot'),
  new SlashCommandBuilder()
    .setName('startgame')
    .setDescription('Start a new game of Cards Against Humanity')
    .addIntegerOption(option =>
      option.setName('points')
        .setDescription('Points needed to win (default: 5)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(25)),
  new SlashCommandBuilder()
    .setName('endgame')
    .setDescription('End the current game'),
  new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a player to the game (leader only)')
    .addUserOption(option =>
      option.setName('player')
        .setDescription('The player to add')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('boot')
    .setDescription('Boot a player from the game (leader only)')
    .addUserOption(option =>
      option.setName('player')
        .setDescription('The player to boot')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('score')
    .setDescription('Show current scores'),
  new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the game'),
  new SlashCommandBuilder()
    .setName('pick')
    .setDescription('Pick a card from your hand')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('The number of the card to pick')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('judge')
    .setDescription('Choose a winner (Judge only)')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('The number of the winning card')
        .setRequired(true)),
].map(command => command.toJSON());

export async function startBot() {
  if (!process.env.DISCORD_TOKEN) {
    console.warn("DISCORD_TOKEN not set. Bot will not start.");
    return;
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    if (process.env.DISCORD_APPLICATION_ID) {
      console.log('Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
        { body: commands },
      );
      console.log('Successfully reloaded application (/) commands.');
    }

    client.on("error", (error) => {
      console.error("Discord client error:", error);
    });

    client.on("warn", (warning) => {
      console.warn("Discord client warning:", warning);
    });

    client.on("disconnect", () => {
      console.log("Bot disconnected. Attempting to reconnect...");
    });

    client.on("shardDisconnect", (event, shardId) => {
      console.log(`Shard ${shardId} disconnected (code ${event.code}). Will auto-reconnect.`);
    });

    client.on("shardReconnecting", (shardId) => {
      console.log(`Shard ${shardId} reconnecting...`);
    });

    client.on("shardResume", (shardId) => {
      console.log(`Shard ${shardId} resumed.`);
    });

    await client.login(process.env.DISCORD_TOKEN);
    console.log(`Logged in as ${client.user?.tag}!`);
  } catch (error) {
    console.error("Failed to login or register commands:", error);
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const { customId, user, channelId, guildId } = interaction;

    if (customId === 'view_hand') {
      const game = await storage.getGame(channelId!);
      if (!game) {
        return interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      }
      const player = await storage.getPlayer(game.id, user.id);
      if (!player) {
        return interaction.reply({ content: "You are not in the game.", ephemeral: true });
      }

      if (game.judgeId === user.id) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("You Are the Judge!")
              .setDescription("You don't play cards this round. Wait for everyone to submit, then pick the winner!")
              .setColor(0xFFD700)
          ],
          ephemeral: true
        });
      }

      const blackCard = await storage.getCard(game.currentBlackCardId || 0);
      const hand = await storage.getHand(player.id);
      const played = await storage.getPlayedCards(game.id);
      const playerPlayed = played.filter(p => p.playerId === player.id);
      const pickNeeded = (blackCard?.pick || 1) - playerPlayed.length;

      if (pickNeeded <= 0) {
        return interaction.reply({ content: "You've already played your cards this round.", ephemeral: true });
      }

      if (game.status !== "playing") {
        const playedCardIds = new Set(playerPlayed.map(p => p.id));
        const description = hand.map((c, i) => {
          if (playedCardIds.has(c.id)) return `**${i + 1}.** ~~${c.text}~~`;
          return `**${i + 1}.** ${c.text}`;
        }).join("\n");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Your Hand")
              .setDescription(description || "Empty hand.")
              .setColor(0x2F3136)
          ],
          ephemeral: true
        });
      }

      const playedCardIds = new Set(playerPlayed.map(p => p.id));
      const availableHand = hand.filter(c => !playedCardIds.has(c.id));

      if (availableHand.length < pickNeeded) {
        return interaction.reply({
          content: `You only have **${availableHand.length}** card(s) but this round needs **${pickNeeded}**. You'll sit this one out.`,
          ephemeral: true
        });
      }

      const key = pickUIKey(guildId!, channelId!, user.id);

      const existing = pickUIs.get(key);
      if (existing?.collector && !existing.collector.ended) existing.collector.stop("replaced");

      const state: PickUIState = {
        gameId: game.id,
        playerId: player.id,
        interaction,
        hand: availableHand,
        pickCount: pickNeeded,
        selectedIdxs: [],
        ended: false,
        collector: null,
      };
      pickUIs.set(key, state);

      await interaction.reply({
        embeds: [renderHandEmbed(state.hand, state.selectedIdxs, state.pickCount, blackCard?.text || "None")],
        ephemeral: true,
      });

      const channel = interaction.channel as any;
      const collector = channel.createMessageCollector({
        time: ROUND_TIMEOUT,
        filter: (m: any) => m.author.id === user.id && m.channelId === channelId,
      });
      state.collector = collector;

      collector.on("collect", async (m: any) => {
        if (state.ended) return;

        const currentGame = await storage.getGame(channelId!);
        if (!currentGame || currentGame.status !== "playing" || currentGame.id !== state.gameId) {
          state.ended = true;
          collector.stop("round_ended");
          return;
        }

        const parsed = parseSinglePick(m.content, state.hand.length);

        const isPureNumber = /^(10|[1-9])$/.test(m.content.trim());
        const canDelete = isPureNumber && m.guild?.members?.me?.permissionsIn(m.channel)?.has(PermissionFlagsBits.ManageMessages);
        if (canDelete) await m.delete().catch(() => {});

        if (parsed.kind === "ignore") return;

        if (parsed.kind === "reset") {
          state.selectedIdxs = [];
          await state.interaction.editReply({
            embeds: [renderHandEmbed(state.hand, state.selectedIdxs, state.pickCount, blackCard?.text || "None")],
          }).catch(() => {});
          return;
        }

        if (parsed.kind === "invalid" || parsed.kind === "out_of_range") {
          await state.interaction.followUp({
            ephemeral: true,
            content: `Pick a number between **1** and **${state.hand.length}**.`,
          }).catch(() => {});
          return;
        }

        const { idx, n } = parsed as { idx: number; n: number };

        if (state.selectedIdxs.includes(idx)) {
          await state.interaction.followUp({
            ephemeral: true,
            content: `You already selected card **${n}**. Pick a different number.`,
          }).catch(() => {});
          return;
        }

        if (state.selectedIdxs.length >= state.pickCount) {
          await state.interaction.followUp({
            ephemeral: true,
            content: `You already selected **${state.pickCount}** card(s). Type \`reset\` to change.`,
          }).catch(() => {});
          return;
        }

        state.selectedIdxs.push(idx);

        await state.interaction.editReply({
          embeds: [renderHandEmbed(state.hand, state.selectedIdxs, state.pickCount, blackCard?.text || "None")],
        }).catch(() => {});

        if (state.selectedIdxs.length === state.pickCount) {
          state.ended = true;
          collector.stop("complete");
        }
      });

      collector.on("end", async (_collected: any, reason: string) => {
        const current = pickUIs.get(key);
        if (!current) return;

        if (reason === "complete") {
          const pickedCards = current.selectedIdxs.map(i => current.hand[i]);

          for (const card of pickedCards) {
            await storage.playCard(current.gameId, current.playerId, card.id);
          }

          const pickedText = pickedCards.map((c, i) => `**${i + 1}.** ${c.text}`).join("\n");
          await current.interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Submitted!")
                .setDescription(pickedText)
                .setColor(0x00FF00)
            ],
          }).catch(() => {});

          await (channel as any)?.send(`${user.username} has finished playing their cards!`);
          pickUIs.delete(key);

          if (blackCard) {
            await checkAllPlayed(channel, current.gameId, blackCard);
          }
        } else if (reason !== "replaced") {
          await current.interaction.editReply({
            embeds: [
              renderHandEmbed(current.hand, current.selectedIdxs, current.pickCount, blackCard?.text || "None")
                .setFooter({ text: `Picker timed out. Click View Cards again to retry.` })
            ],
          }).catch(() => {});
          pickUIs.delete(key);
        }
      });
    }

    if (customId === 'join_game') {
      const game = await storage.getGame(channelId!);
      if (!game || game.status === "finished") {
        return interaction.reply({ content: "No active game to join.", ephemeral: true });
      }

      if (user.bot) {
        return interaction.reply({ content: "Bots can't join the game!", ephemeral: true });
      }

      const existingPlayer = await storage.getPlayer(game.id, user.id);
      if (existingPlayer) {
        return interaction.reply({ content: "You're already in the game!", ephemeral: true });
      }

      await storage.addPlayer(game.id, user.id, user.username, false);
      const players = await storage.getPlayers(game.id);
      const playerList = players.map(p => p.isVip ? `**${p.username}** (leader)` : p.username).join(", ");

      if (game.status === "playing" || game.status === "judging") {
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(originalEmbed)
          .setDescription(`${originalEmbed.description}\n\n**Players (${players.length}):** ${playerList}`);
        await interaction.update({ embeds: [updatedEmbed], components: interaction.message.components as any });
        await (interaction.channel as any)?.send(`**${user.username}** joined the game! They'll get cards at the start of the next round.`);
      } else {
        const leader = players.find(p => p.isVip);
        const updatedEmbed = new EmbedBuilder()
          .setTitle("Cards Against Humanity")
          .setDescription(`**${leader?.username}** started a new game!\n\nClick **Join Game** to join, or the leader can use \`/add @player\`.\nThe leader (**${leader?.username}**) clicks **Start Game** when ready.\n\nNeed at least 3 players to start.\n**Points to win:** ${game.pointsToWin || 5}\n\n**Players (${players.length}):** ${playerList}`)
          .setColor(0x000000);
        await interaction.update({ embeds: [updatedEmbed], components: interaction.message.components as any });
      }
    }

    if (customId === 'start_game') {
      const game = await storage.getGame(channelId!);
      if (!game || game.status !== "waiting") {
        return interaction.reply({ content: "No game to start.", ephemeral: true });
      }

      const player = await storage.getPlayer(game.id, user.id);
      if (!player || !player.isVip) {
        return interaction.reply({ content: "Only the game leader can start the game!", ephemeral: true });
      }

      const players = await storage.getPlayers(game.id);
      if (players.length < 3) {
        return interaction.reply({ content: `Need at least 3 players to start. Currently have ${players.length}.`, ephemeral: true });
      }

      await interaction.reply("Starting the game...");
      await storage.updateGameStatus(game.id, "playing");

      const judge = players[Math.floor(Math.random() * players.length)];
      await storage.setGameJudge(game.id, judge.userId);

      const dealtCardIds: number[] = [];
      for (const p of players) {
        const cards = await storage.getWhiteCards(HAND_SIZE, dealtCardIds);
        for (const card of cards) {
          await storage.addToHand(p.id, card.id);
          dealtCardIds.push(card.id);
        }
      }

      await startRound(interaction.channel, game.id);
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, channelId, guildId, user } = interaction;

  if (commandName === "help") {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Cards Against Humanity Bot Help")
          .setDescription("How to play:")
          .addFields(
            { name: "/startgame", value: "Create a new game with Join and Start buttons" },
            { name: "Join Game button", value: "Click to join a game (works before and during a game)" },
            { name: "/add @player", value: "Add a player to the game (leader only)" },
            { name: "/boot @player", value: "Boot a player from the game (leader only)" },
            { name: "/endgame", value: "End the current game" },
            { name: "View Cards button", value: "Click to see your hand, then type a number in chat to play" },
            { name: "/score", value: "Show current scores" },
            { name: "/leave", value: "Leave the game" }
          )
          .setFooter({ text: "Each round has a 60-second time limit!" })
          .setColor(0x00AE86)
      ]
    });
  }

  if (commandName === "startgame") {
    let game = await storage.getGame(channelId!);
    if (game) {
      if (game.status === "waiting") {
        const players = await storage.getPlayers(game.id);
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder().setCustomId('join_game').setLabel('Join Game').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('start_game').setLabel('Start Game').setStyle(ButtonStyle.Primary),
          );
        return interaction.reply({
          content: `A game is already waiting for players! (${players.length} joined). Click **Join Game** or use \`/add @player\`.`,
          components: [row]
        });
      }
      if (game.status === "playing" || game.status === "judging") {
        return interaction.reply({ content: "A game is already in progress in this channel!", ephemeral: true });
      }
    }

    const pointsToWin = options.getInteger('points') || 5;
    game = await storage.createGame(guildId!, channelId!, pointsToWin);
    await storage.addPlayer(game.id, user.id, user.username, true);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setCustomId('join_game').setLabel('Join Game').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('start_game').setLabel('Start Game').setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Cards Against Humanity")
          .setDescription(`**${user.username}** started a new game!\n\nClick **Join Game** to join, or the leader can use \`/add @player\`.\nThe leader (**${user.username}**) clicks **Start Game** when ready.\n\nNeed at least 3 players to start.\n**Points to win:** ${pointsToWin}\n\n**Players (1):** **${user.username}** (leader)`)
          .setColor(0x000000)
      ],
      components: [row]
    });
  }

  if (commandName === "add") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No active game in this channel. Use /startgame first.", ephemeral: true });
      return;
    }

    const leader = await storage.getPlayer(game.id, user.id);
    if (!leader || !leader.isVip) {
      await interaction.reply({ content: "Only the game leader can add players!", ephemeral: true });
      return;
    }

    const targetUser = options.getUser('player')!;
    if (targetUser.bot) {
      await interaction.reply({ content: "You can't add bots to the game!", ephemeral: true });
      return;
    }

    const existingPlayer = await storage.getPlayer(game.id, targetUser.id);
    if (existingPlayer) {
      await interaction.reply({ content: `${targetUser.username} is already in the game!`, ephemeral: true });
      return;
    }

    await storage.addPlayer(game.id, targetUser.id, targetUser.username, false);
    const players = await storage.getPlayers(game.id);

    if (game.status === "playing" || game.status === "judging") {
      await interaction.reply(`${targetUser.username} has been added! They'll get cards at the start of the next round. (${players.length} players)`);
    } else {
      await interaction.reply(`${targetUser.username} has been added to the game! (${players.length} players)`);
    }
  }

  if (commandName === "endgame") {
    const game = await storage.getGame(channelId!);
    if (!game || game.status === "finished") {
      await interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      return;
    }

    if (endedGames.has(game.id)) {
      await interaction.reply({ content: "That game is already ended.", ephemeral: true });
      return;
    }

    await endGame(interaction.channel, game.id, undefined, "The game has been ended.");
    await interaction.reply({ content: "Game ended!", ephemeral: true });
  }

  if (commandName === "pick") {
    await interaction.reply({ content: "The /pick command has been replaced! Click the **View Cards** button to select and play cards.", ephemeral: true });
  }

  if (commandName === "judge") {
    const game = await storage.getGame(channelId!);
    if (!game || game.status !== "judging") {
      await interaction.reply({ content: "Not currently judging.", ephemeral: true });
      return;
    }

    if (game.judgeId !== user.id) {
      await interaction.reply({ content: "You are not the judge!", ephemeral: true });
      return;
    }

    clearRoundTimer(game.id);
    await handleJudgeSelection(interaction, game, options.getInteger('number')! - 1);
  }

  if (commandName === "score") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      return;
    }

    const players = await storage.getPlayers(game.id);
    const scores = players.map(p => `${p.username}: ${p.score}`).join("\n");

    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle("Scores").setDescription(scores || "No players yet.")]
    });
  }

  if (commandName === "boot") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      return;
    }

    const leader = await storage.getPlayer(game.id, user.id);
    if (!leader || !leader.isVip) {
      await interaction.reply({ content: "Only the game leader can boot players!", ephemeral: true });
      return;
    }

    const targetUser = options.getUser('player')!;
    if (targetUser.id === user.id) {
      await interaction.reply({ content: "You can't boot yourself!", ephemeral: true });
      return;
    }

    const targetPlayer = await storage.getPlayer(game.id, targetUser.id);
    if (!targetPlayer) {
      await interaction.reply({ content: `${targetUser.username} is not in the game.`, ephemeral: true });
      return;
    }

    const wasJudge = game.judgeId === targetUser.id;
    await storage.removePlayer(game.id, targetUser.id);
    await interaction.reply(`${targetUser.username} has been booted from the game.`);

    await handlePlayerRemoval(interaction.channel, game, wasJudge);
  }

  if (commandName === "leave") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      return;
    }
    const player = await storage.getPlayer(game.id, user.id);
    if (!player) {
      await interaction.reply({ content: "You are not in the game.", ephemeral: true });
      return;
    }
    const wasJudge = game.judgeId === user.id;
    await storage.removePlayer(game.id, user.id);
    await interaction.reply(`${user.username} left the game.`);

    await handlePlayerRemoval(interaction.channel, game, wasJudge);
  }
});

async function handlePlayerRemoval(channel: any, game: any, wasJudge: boolean) {
  try {
    const remainingPlayers = await storage.getPlayers(game.id);

    if (remainingPlayers.length < 2) {
      await endGame(channel, game.id, undefined, "Not enough players to continue.");
      return;
    }

    if (game.status === "waiting") return;

    if (wasJudge) {
      clearRoundTimer(game.id);
      await storage.removePlayedCardsFromHands(game.id);
      await storage.clearPlayedCards(game.id);
      const nextJudgeIndex = 0;
      const nextJudge = remainingPlayers[nextJudgeIndex];
      await storage.setGameJudge(game.id, nextJudge.userId);
      await channel.send("The judge left! Starting a new round with a new judge...");
      await delay(ROUND_BREAK);
      await startRound(channel, game.id);
      return;
    }

    if (game.status === "playing") {
      const blackCard = game.currentBlackCardId ? await storage.getCard(game.currentBlackCardId) : null;
      if (blackCard) {
        await checkAllPlayed(channel, game.id, blackCard);
      }
    }

    if (game.status === "judging") {
      const currentlyPlayed = await storage.getPlayedCards(game.id);
      if (currentlyPlayed.length === 0) {
        await channel.send("No cards left to judge. Starting a new round...");
        const players = await storage.getPlayers(game.id);
        const currentJudgeIndex = players.findIndex((p: any) => p.userId === game.judgeId);
        const nextJudge = players[(currentJudgeIndex + 1) % players.length];
        await storage.setGameJudge(game.id, nextJudge.userId);
        await storage.clearPlayedCards(game.id);
        await delay(ROUND_BREAK);
        await startRound(channel, game.id);
      }
    }
  } catch (e) {
    console.error("Error in handlePlayerRemoval:", e);
  }
}

async function handleJudgeSelection(source: any, game: any, index: number) {
  try {
    const playedCards = await storage.getPlayedCards(game.id);

    const shuffledOrder = judgeViewMap.get(game.id);
    let playerIds: number[];
    if (shuffledOrder) {
      playerIds = shuffledOrder;
    } else {
      const grouped: { [playerId: number]: any[] } = {};
      playedCards.forEach(pc => {
        if (!grouped[pc.playerId]) grouped[pc.playerId] = [];
        grouped[pc.playerId].push(pc);
      });
      playerIds = Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(Number);
    }

    if (index < 0 || index >= playerIds.length) {
      if (source.reply) {
        await source.reply({ content: "Invalid selection.", ephemeral: true });
      }
      return;
    }

    const winnerId = playerIds[index];
    const winnerCard = playedCards.find(c => c.playerId === winnerId);

    if (!winnerCard) {
      if (source.reply) {
        await source.reply({ content: "Could not determine winner.", ephemeral: true });
      }
      return;
    }

    const winner = await storage.incrementScore(winnerCard.playerId);
    const blackCard = game.currentBlackCardId ? await storage.getCard(game.currentBlackCardId) : null;
    const winnerGroup = playedCards.filter(c => c.playerId === winnerId).map(c => `"${c.text}"`).join(" / ");

    const allPlayers = await storage.getPlayers(game.id);
    const scoreList = allPlayers.sort((a: any, b: any) => b.score - a.score).map((p: any) => `${p.username}: **${p.score}**`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Winner Selected!")
      .setDescription(`**Black Card:** ${prettyBlanks(blackCard?.text || "")}\n\n**${winner.username}** wins the round!\n**Winning Combo:** ${winnerGroup}\n\n**Scores:**\n${scoreList}\n\n**Playing to:** ${game.pointsToWin || 5} points`)
      .setColor(0xFFD700);

    const channel = source.channel || source;
    if (source.reply && typeof source.reply === 'function' && source.isChatInputCommand?.()) {
      await source.reply({ embeds: [embed] });
    } else if (source.reply && typeof source.reply === 'function') {
      await source.reply({ embeds: [embed] });
    } else {
      await channel.send({ embeds: [embed] });
    }

    console.log("WIN CHECK:", winnerCard.playerId, winner.score, "/ needed:", game.pointsToWin || 5, "ended?", endedGames.has(game.id));
    if (winner.score >= (game.pointsToWin || 5)) {
      await endGame(channel, game.id, winnerCard.playerId);
      return;
    }

    const players = await storage.getPlayers(game.id);
    const currentJudgeIndex = players.findIndex((p: any) => p.userId === game.judgeId);
    const nextJudge = players[(currentJudgeIndex + 1) % players.length];
    await storage.setGameJudge(game.id, nextJudge.userId);
    await storage.removePlayedCardsFromHands(game.id);
    await storage.clearPlayedCards(game.id);
    judgeViewMap.delete(game.id);
    await delay(ROUND_BREAK);
    await startRound(channel, game.id);
  } catch (e) {
    console.error("Error in handleJudgeSelection:", e);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.guildId) {
    const game = await storage.getGame(message.channelId);

    if (game && game.status === "judging" && game.judgeId === message.author.id) {
      const num = parseInt(message.content.trim());
      if (!isNaN(num)) {
        const index = num - 1;
        const shuffledOrder = judgeViewMap.get(game.id);
        const maxOptions = shuffledOrder ? shuffledOrder.length : 0;

        if (maxOptions > 0 && index >= 0 && index < maxOptions) {
          clearRoundTimer(game.id);
          await handleJudgeSelection(message.channel, game, index);
          return;
        }
      }
    }
  }

  if (message.channel.type === ChannelType.DM) {
    await message.reply("Use /startgame in a server channel to start a game!");
  }
});

async function checkAllPlayed(channel: any, gameId: number, blackCard: any) {
  const game = await storage.getGame(channel.id);
  if (!game || game.status !== "playing") return;

  const players = await storage.getPlayers(gameId);
  const currentlyPlayed = await storage.getPlayedCards(gameId);

  const requiredPicks = blackCard.pick || 1;
  const eligiblePlayers = [];
  for (const p of players) {
    if (p.userId === game.judgeId) continue;
    const hand = await storage.getHand(p.id);
    const played = currentlyPlayed.filter(c => c.playerId === p.id);
    const playedCardIds = new Set(played.map(pc => pc.id));
    const availableCards = hand.filter(h => !playedCardIds.has(h.id));
    const totalAvailable = availableCards.length + played.length;
    if (totalAvailable >= requiredPicks || played.length >= requiredPicks) {
      eligiblePlayers.push({ player: p, playedCount: played.length });
    }
  }

  if (eligiblePlayers.length === 0) return;

  const allDone = eligiblePlayers.every(e => e.playedCount >= (blackCard.pick || 1));
  if (allDone) {
    const freshGame = await storage.getGame(channel.id);
    if (!freshGame || freshGame.status !== "playing") return;
    clearRoundTimer(gameId);
    await transitionToJudging(channel, gameId, blackCard, freshGame);
  }
}

async function transitionToJudging(channel: any, gameId: number, blackCard: any, game: any) {
  if (endedGames.has(gameId)) return;
  if (activeTransitions.has(gameId)) return;
  activeTransitions.add(gameId);

  try {
    const currentGame = await storage.getGame(channel.id);
    if (!currentGame || currentGame.status === "finished") return;

    await storage.updateGameStatus(gameId, "judging");

    const requiredPicks = blackCard?.pick || 1;
    const currentlyPlayed = await storage.getPlayedCards(gameId);

    const playerPlayedCount: { [playerId: number]: number } = {};
    currentlyPlayed.forEach(c => {
      playerPlayedCount[c.playerId] = (playerPlayedCount[c.playerId] || 0) + 1;
    });

    const incompletePlayerIds = Object.keys(playerPlayedCount)
      .filter(pid => playerPlayedCount[Number(pid)] < requiredPicks)
      .map(Number);
    for (const pid of incompletePlayerIds) {
      await db.delete(playedCardsTable).where(
        and(eq(playedCardsTable.gameId, gameId), eq(playedCardsTable.playerId, pid))
      );
    }

    const validPlayed = await storage.getPlayedCards(gameId);

    if (validPlayed.length === 0) {
      await channel.send("No one played enough cards this round. Skipping to next round...");
      const players = await storage.getPlayers(gameId);
      const currentJudgeIndex = players.findIndex((p: any) => p.userId === game.judgeId);
      const nextJudge = players[(currentJudgeIndex + 1) % players.length];
      await storage.setGameJudge(gameId, nextJudge.userId);
      await storage.removePlayedCardsFromHands(gameId);
      await storage.clearPlayedCards(gameId);
      await startRound(channel, gameId);
      return;
    }

    const groupedPlayed: { [playerId: number]: string[] } = {};
    const playerNameMap: { [playerId: number]: string } = {};
    validPlayed.forEach(c => {
      if (!groupedPlayed[c.playerId]) groupedPlayed[c.playerId] = [];
      groupedPlayed[c.playerId].push(c.text);
      playerNameMap[c.playerId] = c.username;
    });

    const rawPlayerIds = Object.keys(groupedPlayed).map(Number);
    const shuffledPlayerIds = shuffleArray(rawPlayerIds);
    judgeViewMap.set(gameId, shuffledPlayerIds);
    const optionsList = shuffledPlayerIds.map((pid, i) => `**${i + 1}.** ${groupedPlayed[pid].join(" / ")}`).join("\n");

    const allPlayers = await storage.getPlayers(gameId);
    const playedPlayerIds = new Set(shuffledPlayerIds);
    const submitted: string[] = shuffledPlayerIds.map(pid => playerNameMap[pid]);
    const missed: string[] = [];
    for (const p of allPlayers) {
      if (p.userId === game.judgeId) continue;
      if (playedPlayerIds.has(p.id)) continue;
      const hand = await storage.getHand(p.id);
      if (hand.length > 0) {
        missed.push(p.username);
      }
    }

    const submittedText = `**Submitted (${submitted.length}):** ${submitted.join(", ")}`;
    const missedText = missed.length > 0 ? `\n**Didn't make it:** ${missed.join(", ")}` : "";

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(prettyBlanks(blackCard?.text || ""))
          .setDescription(`**Judge:** <@${game.judgeId}>\n\n${submittedText}${missedText}\n\n**Options:**\n${optionsList}\n\nJudge, pick the winner by sending the number (e.g. \`1\`) or using \`/judge <number>\`\n\nYou have **60 seconds** to decide!`)
          .setColor(0x00FF00)
      ]
    });

    const timer = setTimeout(async () => {
      roundTimers.delete(gameId);
      try {
        console.log("Judging timer fired. gameId:", gameId, "ended?", endedGames.has(gameId));
        const latestGame = await storage.getGame(channel.id);
        if (!latestGame || latestGame.id !== gameId || latestGame.status !== "judging") return;

        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Time's Up!")
              .setDescription("The judge didn't pick in time. No winner this round. Moving on...")
              .setColor(0xFF6600)
          ]
        });

        const players = await storage.getPlayers(gameId);
        if (players.length < 2) {
          await endGame(channel, gameId, undefined, "Not enough players to continue.");
          return;
        }
        const currentJudgeIndex = players.findIndex((p: any) => p.userId === latestGame.judgeId);
        const nextJudge = players[(currentJudgeIndex + 1) % players.length];
        await storage.setGameJudge(gameId, nextJudge.userId);
        await storage.removePlayedCardsFromHands(gameId);
        await storage.clearPlayedCards(gameId);
        await startRound(channel, gameId);
      } catch (e) {
        console.error("Error in judging timer:", e);
      }
    }, ROUND_TIMEOUT);

    roundTimers.set(gameId, timer);
  } finally {
    activeTransitions.delete(gameId);
  }
}

async function startRound(channel: any, gameId: number) {
  console.log("Starting round. gameId:", gameId, "ended?", endedGames.has(gameId));
  if (endedGames.has(gameId)) return;
  clearRoundTimer(gameId);

  const currentGame = await storage.getGame(channel.id);
  if (!currentGame || currentGame.status === "finished") return;

  await storage.updateGameStatus(gameId, "playing");
  const blackCard = await storage.getBlackCard();

  if (!blackCard) {
    await channel.send("Error: Out of black cards!");
    return;
  }

  await storage.setGameBlackCard(gameId, blackCard.id);

  const players = await storage.getPlayers(gameId);
  const existingHandCardIds = await storage.getAllHandCardIds(gameId);
  const excludeIds = [...existingHandCardIds];
  for (const p of players) {
    const hand = await storage.getHand(p.id);
    if (hand.length < HAND_SIZE) {
      const newCards = await storage.getWhiteCards(HAND_SIZE - hand.length, excludeIds);
      for (const card of newCards) {
        await storage.addToHand(p.id, card.id);
        excludeIds.push(card.id);
      }
    }
  }

  const game = await storage.getGame(channel.id);
  const judgePlayer = players.find(p => p.userId === game?.judgeId);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('view_hand')
        .setLabel('View Cards')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('join_game')
        .setLabel('Join Game')
        .setStyle(ButtonStyle.Success),
    );

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(prettyBlanks(blackCard.text))
        .setDescription(`**Judge:** <@${game?.judgeId}>${(blackCard.pick || 1) > 1 ? `\n\n*Pick ${blackCard.pick} cards!*` : ""}`)
        .setFooter({ text: "Click 'View Cards' to see your hand, then type a number to play! You have 60 seconds!" })
        .setColor(0x000000)
    ],
    components: [row]
  });

  const timer = setTimeout(async () => {
    roundTimers.delete(gameId);
    try {
      console.log("Playing timer fired. gameId:", gameId, "ended?", endedGames.has(gameId));
      const currentGame = await storage.getGame(channel.id);
      if (!currentGame || currentGame.id !== gameId || currentGame.status !== "playing") return;

      const currentBlackCard = currentGame.currentBlackCardId ? await storage.getCard(currentGame.currentBlackCardId) : null;
      if (!currentBlackCard) return;

      const playedCards = await storage.getPlayedCards(gameId);
      const requiredPicks = currentBlackCard.pick || 1;
      if (playedCards.length > 0) {
        const allPlayers = await storage.getPlayers(gameId);
        const playerPlayedCount: { [playerId: number]: number } = {};
        playedCards.forEach(c => {
          playerPlayedCount[c.playerId] = (playerPlayedCount[c.playerId] || 0) + 1;
        });
        const submitted: string[] = [];
        const partial: string[] = [];
        const missed: string[] = [];
        for (const p of allPlayers) {
          if (p.userId === currentGame.judgeId) continue;
          const hand = await storage.getHand(p.id);
          const count = playerPlayedCount[p.id] || 0;
          if (hand.length === 0 && count === 0) continue;
          if (count >= requiredPicks) {
            submitted.push(p.username);
          } else if (count > 0) {
            partial.push(p.username);
            missed.push(p.username);
          } else {
            missed.push(p.username);
          }
        }
        const submittedText = submitted.length > 0 ? `**Submitted:** ${submitted.join(", ")}` : "";
        const partialText = partial.length > 0 ? `**Incomplete (not enough cards):** ${partial.join(", ")}` : "";
        const missedOnly = missed.filter(m => !partial.includes(m));
        const missedText = missedOnly.length > 0 ? `**Didn't play:** ${missedOnly.join(", ")}` : "";
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Time's Up!")
              .setDescription(`Not everyone played in time, but we'll move on with what we have.\n\n${submittedText}\n${partialText}\n${missedText}`.trim())
              .setColor(0xFF6600)
          ]
        });
        await transitionToJudging(channel, gameId, currentBlackCard, currentGame);
      } else {
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Time's Up!")
              .setDescription("No one played any cards. Skipping to the next round...")
              .setColor(0xFF6600)
          ]
        });
        const allPlayers = await storage.getPlayers(gameId);
        if (allPlayers.length < 2) {
          await endGame(channel, gameId, undefined, "Not enough players to continue.");
          return;
        }
        const currentJudgeIndex = allPlayers.findIndex((p: any) => p.userId === currentGame.judgeId);
        const nextJudge = allPlayers[(currentJudgeIndex + 1) % allPlayers.length];
        await storage.setGameJudge(gameId, nextJudge.userId);
        await storage.removePlayedCardsFromHands(gameId);
        await storage.clearPlayedCards(gameId);
        await startRound(channel, gameId);
      }
    } catch (e) {
      console.error("Error in playing timer:", e);
    }
  }, ROUND_TIMEOUT);

  roundTimers.set(gameId, timer);
}
