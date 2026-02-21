import { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { storage } from "./storage";

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const roundTimers: Map<number, NodeJS.Timeout> = new Map();
const usedBlackCards: Map<number, number[]> = new Map();

function formatCardText(text: string): string {
  return text.replace(/(\\_)+/g, (match) => {
    const count = (match.match(/\\_/g) || []).length;
    return '`' + '_'.repeat(count) + '`';
  });
}

function clearRoundTimer(gameId: number) {
  const existing = roundTimers.get(gameId);
  if (existing) {
    clearTimeout(existing);
    roundTimers.delete(gameId);
  }
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
      const playedCardIds = new Set(playerPlayed.map(p => p.id));
      const description = hand.map((c, i) => {
        if (playedCardIds.has(c.id)) return `**${i + 1}.** ~~${c.text}~~`;
        return `**${i + 1}.** ${c.text}`;
      }).join("\n");

      const pickNeeded = (blackCard?.pick || 1) - playerPlayed.length;
      const pickInfo = pickNeeded > 0 ? `Pick ${pickNeeded} card(s).` : "You've already played your cards this round.";

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Your Hand")
            .setDescription(`## ${formatCardText(blackCard?.text || "None")}\n\n${description || "Empty hand."}\n\n${pickInfo}\nType the number (e.g. \`1\`) in the channel to play.`)
            .setColor(0x2F3136)
        ],
        ephemeral: true
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
        await interaction.channel?.send(`**${user.username}** joined the game! They'll get cards at the start of the next round.`);
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

      for (const p of players) {
        const cards = await storage.getWhiteCards(HAND_SIZE);
        for (const card of cards) {
          await storage.addToHand(p.id, card.id);
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
            { name: "Type a number (1-10)", value: "Play a card from your hand during a round" },
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
    if (game && game.status !== "finished") {
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
      return interaction.reply({ content: "A game is already in progress in this channel!", ephemeral: true });
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

    clearRoundTimer(game.id);

    const players = await storage.getPlayers(game.id);
    const scores = players.map(p => `${p.username}: ${p.score}`).join("\n");

    await storage.updateGameStatus(game.id, "finished");
    await storage.removePlayedCardsFromHands(game.id);
    await storage.clearPlayedCards(game.id);
    usedBlackCards.delete(game.id);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Game Over!")
          .setDescription(`The game has been ended.\n\n**Final Scores:**\n${scores || "No scores."}`)
          .setColor(0xFF0000)
      ]
    });
  }

  if (commandName === "pick") {
    const game = await storage.getGame(channelId!);
    if (!game || game.status !== "playing") {
      await interaction.reply({ content: "No active round to pick cards for.", ephemeral: true });
      return;
    }

    if (game.judgeId === user.id) {
      await interaction.reply({ content: "You are the judge this round! You don't pick a card.", ephemeral: true });
      return;
    }

    const player = await storage.getPlayer(game.id, user.id);
    if (!player) {
      await interaction.reply({ content: "You are not in this game!", ephemeral: true });
      return;
    }

    const blackCard = await storage.getCard(game.currentBlackCardId!);
    if (!blackCard) {
      await interaction.reply({ content: "Error: Black card not found.", ephemeral: true });
      return;
    }

    const played = await storage.getPlayedCards(game.id);
    const playerPlayed = played.filter(p => p.playerId === player.id);

    if (playerPlayed.length >= (blackCard.pick || 1)) {
      await interaction.reply({ content: `You have already played the required ${(blackCard.pick || 1)} cards this round.`, ephemeral: true });
      return;
    }

    const index = options.getInteger('number')! - 1;
    const hand = await storage.getHand(player.id);
    const playedCardIds = new Set(playerPlayed.map(p => p.id));

    if (isNaN(index) || index < 0 || index >= hand.length) {
      await interaction.reply({ content: "Invalid card number. Click View Cards to check your hand.", ephemeral: true });
      return;
    }

    const selectedCard = hand[index];
    if (playedCardIds.has(selectedCard.id)) {
      await interaction.reply({ content: "You already played that card. Pick a different one.", ephemeral: true });
      return;
    }

    await storage.playCard(game.id, player.id, selectedCard.id);

    const remainingToPick = (blackCard.pick || 1) - (playerPlayed.length + 1);

    if (remainingToPick > 0) {
      const newPlayedIds = new Set(Array.from(playedCardIds).concat([selectedCard.id]));
      const handList = hand.map((c, i) => {
        if (newPlayedIds.has(c.id)) return `**${i + 1}.** ~~${c.text}~~`;
        return `**${i + 1}.** ${c.text}`;
      }).join("\n");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Played: ${selectedCard.text}`)
            .setDescription(`Pick ${remainingToPick} more card(s).\n\n## ${formatCardText(blackCard.text)}\n\n${handList}\n\nType the number (e.g. \`1\`) in the channel to play.`)
            .setColor(0x2F3136)
        ],
        ephemeral: true
      });
    } else {
      await interaction.reply({ content: `You played your final card: ${selectedCard.text}`, ephemeral: true });
      await interaction.channel?.send(`${user.username} has finished playing their cards!`);
    }

    await checkAllPlayed(interaction.channel, game.id, blackCard);
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
      clearRoundTimer(game.id);
      await storage.updateGameStatus(game.id, "finished");
      usedBlackCards.delete(game.id);
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Game Over")
            .setDescription("Not enough players to continue. The game has ended.")
            .setColor(0xFF0000)
        ]
      });
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

    const grouped: { [playerId: number]: any[] } = {};
    playedCards.forEach(pc => {
      if (!grouped[pc.playerId]) grouped[pc.playerId] = [];
      grouped[pc.playerId].push(pc);
    });
    const playerIds = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

    if (index < 0 || index >= playerIds.length) {
      if (source.reply) {
        await source.reply({ content: "Invalid selection.", ephemeral: true });
      }
      return;
    }

    const winnerId = parseInt(playerIds[index]);
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
      .setDescription(`**${winner.username}** wins the round!\n\n**Black Card:** ${formatCardText(blackCard?.text || "")}\n**Winning Combo:** ${winnerGroup}\n\n**Scores:**\n${scoreList}\n\n**Playing to:** ${game.pointsToWin || 5} points`)
      .setColor(0xFFD700);

    const channel = source.channel || source;
    if (source.reply && typeof source.reply === 'function' && source.isChatInputCommand?.()) {
      await source.reply({ embeds: [embed] });
    } else if (source.reply && typeof source.reply === 'function') {
      await source.reply({ embeds: [embed] });
    } else {
      await channel.send({ embeds: [embed] });
    }

    if (winner.score >= (game.pointsToWin || 5)) {
      clearRoundTimer(game.id);
      await storage.updateGameStatus(game.id, "finished");
      await storage.removePlayedCardsFromHands(game.id);
      await storage.clearPlayedCards(game.id);
      usedBlackCards.delete(game.id);
      const players = await storage.getPlayers(game.id);
      const scores = players.map((p: any) => `${p.username}: ${p.score}`).join("\n");
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Game Over!")
            .setDescription(`**${winner.username}** wins the game with ${winner.score} points!\n\n**Final Scores:**\n${scores}`)
            .setColor(0xFFD700)
        ]
      });
      return;
    }

    const players = await storage.getPlayers(game.id);
    const currentJudgeIndex = players.findIndex((p: any) => p.userId === game.judgeId);
    const nextJudge = players[(currentJudgeIndex + 1) % players.length];
    await storage.setGameJudge(game.id, nextJudge.userId);
    await storage.removePlayedCardsFromHands(game.id);
    await storage.clearPlayedCards(game.id);
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

    if (game && game.status === "playing") {
      const player = await storage.getPlayer(game.id, message.author.id);
      if (player && game.judgeId !== message.author.id) {
        const num = parseInt(message.content.trim());
        if (!isNaN(num)) {
          const blackCard = await storage.getCard(game.currentBlackCardId!);
          const played = await storage.getPlayedCards(game.id);
          const playerPlayed = played.filter(p => p.playerId === player.id);

          if (blackCard && playerPlayed.length < (blackCard.pick || 1)) {
            const hand = await storage.getHand(player.id);
            const playedCardIds = new Set(playerPlayed.map(p => p.id));
            const index = num - 1;

            if (index >= 0 && index < hand.length) {
              const selectedCard = hand[index];
              if (playedCardIds.has(selectedCard.id)) {
                try { if (message.deletable) await message.delete(); } catch (e) {}
                return;
              }
              await storage.playCard(game.id, player.id, selectedCard.id);

              const remainingToPick = (blackCard.pick || 1) - (playerPlayed.length + 1);

              try {
                if (message.deletable) {
                  await message.delete();
                }
              } catch (e) {
                console.error("Failed to delete message:", e);
              }

              if (remainingToPick > 0) {
                const newPlayedIds = new Set(Array.from(playedCardIds).concat([selectedCard.id]));
                const handList = hand.map((c, i) => {
                  if (newPlayedIds.has(c.id)) return `**${i + 1}.** ~~${c.text}~~`;
                  return `**${i + 1}.** ${c.text}`;
                }).join("\n");
                await message.author.send({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle(`Played: ${selectedCard.text}`)
                      .setDescription(`Pick ${remainingToPick} more card(s).\n\n## ${formatCardText(blackCard.text)}\n\n${handList}\n\nType the number in the game channel to play.`)
                      .setColor(0x2F3136)
                  ]
                }).catch(() => {
                  message.channel.send({ content: `${message.author.username} played a card. ${remainingToPick} more to pick.` });
                });
              } else {
                await message.channel.send(`${message.author.username} has finished playing their cards!`);
              }

              await checkAllPlayed(message.channel, game.id, blackCard);
              return;
            }
          }
        }
      }
    }

    if (game && game.status === "judging" && game.judgeId === message.author.id) {
      const num = parseInt(message.content.trim());
      if (!isNaN(num)) {
        const index = num - 1;
        const playedCards = await storage.getPlayedCards(game.id);

        const grouped: { [playerId: number]: any[] } = {};
        playedCards.forEach(pc => {
          if (!grouped[pc.playerId]) grouped[pc.playerId] = [];
          grouped[pc.playerId].push(pc);
        });
        const playerIds = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

        if (index >= 0 && index < playerIds.length) {
          clearRoundTimer(game.id);

          try {
            if (message.deletable) {
              await message.delete();
            }
          } catch (e) {
            console.error("Failed to delete message:", e);
          }

          const winnerId = parseInt(playerIds[index]);
          const winnerCard = playedCards.find(c => c.playerId === winnerId);

          if (winnerCard) {
            try {
              const winner = await storage.incrementScore(winnerCard.playerId);
              const blackCard = game.currentBlackCardId ? await storage.getCard(game.currentBlackCardId) : null;
              const winnerGroup = playedCards.filter(c => c.playerId === winnerId).map(c => `"${c.text}"`).join(" / ");

              const roundPlayers = await storage.getPlayers(game.id);
              const roundScoreList = roundPlayers.sort((a, b) => b.score - a.score).map(p => `${p.username}: **${p.score}**`).join("\n");

              await message.channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle("Winner Selected!")
                    .setDescription(`**${winner.username}** wins the round!\n\n**Black Card:** ${formatCardText(blackCard?.text || "")}\n**Winning Combo:** ${winnerGroup}\n\n**Scores:**\n${roundScoreList}\n\n**Playing to:** ${game.pointsToWin || 5} points`)
                    .setColor(0xFFD700)
                ]
              });

              if (winner.score >= (game.pointsToWin || 5)) {
                clearRoundTimer(game.id);
                await storage.updateGameStatus(game.id, "finished");
                await storage.removePlayedCardsFromHands(game.id);
                await storage.clearPlayedCards(game.id);
                usedBlackCards.delete(game.id);
                const allPlayers = await storage.getPlayers(game.id);
                const scores = allPlayers.map(p => `${p.username}: ${p.score}`).join("\n");
                await message.channel.send({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle("Game Over!")
                      .setDescription(`**${winner.username}** wins the game with ${winner.score} points!\n\n**Final Scores:**\n${scores}`)
                      .setColor(0xFFD700)
                  ]
                });
                return;
              }

              const players = await storage.getPlayers(game.id);
              const currentJudgeIndex = players.findIndex(p => p.userId === game.judgeId);
              const nextJudge = players[(currentJudgeIndex + 1) % players.length];
              await storage.setGameJudge(game.id, nextJudge.userId);
              await storage.removePlayedCardsFromHands(game.id);
              await storage.clearPlayedCards(game.id);
              await delay(ROUND_BREAK);
              await startRound(message.channel, game.id);
              return;
            } catch (e) {
              console.error("Error in message-based judge flow:", e);
            }
          }
        }
      }
    }
  }

  if (message.channel.type === ChannelType.DM) {
    await message.reply("Use /startgame in a server channel to start a game!");
  }
});

async function checkAllPlayed(channel: any, gameId: number, blackCard: any) {
  const players = await storage.getPlayers(gameId);
  const game = await storage.getGame(channel.id);
  if (!game) return;

  const currentlyPlayed = await storage.getPlayedCards(gameId);

  const eligiblePlayers = [];
  for (const p of players) {
    if (p.userId === game.judgeId) continue;
    const hand = await storage.getHand(p.id);
    const played = currentlyPlayed.filter(c => c.playerId === p.id);
    if (hand.length > 0 || played.length > 0) {
      eligiblePlayers.push({ player: p, playedCount: played.length });
    }
  }

  if (eligiblePlayers.length === 0) return;

  const allDone = eligiblePlayers.every(e => e.playedCount >= (blackCard.pick || 1));
  if (allDone) {
    clearRoundTimer(gameId);
    await transitionToJudging(channel, gameId, blackCard, game);
  }
}

async function transitionToJudging(channel: any, gameId: number, blackCard: any, game: any) {
  await storage.updateGameStatus(gameId, "judging");

  const currentlyPlayed = await storage.getPlayedCards(gameId);

  if (currentlyPlayed.length === 0) {
    await channel.send("No one played any cards this round. Skipping to next round...");
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
  currentlyPlayed.forEach(c => {
    if (!groupedPlayed[c.playerId]) groupedPlayed[c.playerId] = [];
    groupedPlayed[c.playerId].push(c.text);
    playerNameMap[c.playerId] = c.username;
  });

  const sortedPlayerIds = Object.keys(groupedPlayed).sort((a, b) => Number(a) - Number(b)).map(Number);
  const optionsList = sortedPlayerIds.map((pid, i) => `**${i + 1}.** ${groupedPlayed[pid].join(" / ")}`).join("\n");

  const allPlayers = await storage.getPlayers(gameId);
  const playedPlayerIds = new Set(sortedPlayerIds);
  const submitted: string[] = sortedPlayerIds.map(pid => playerNameMap[pid]);
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
        .setTitle("All cards are in!")
        .setDescription(`**Judge:** <@${game.judgeId}>\n\n## ${formatCardText(blackCard?.text || "")}\n\n${submittedText}${missedText}\n\n**Options:**\n${optionsList}\n\nJudge, pick the winner by sending the number (e.g. \`1\`) or using \`/judge <number>\`\n\nYou have **60 seconds** to decide!`)
        .setColor(0x00FF00)
    ]
  });

  const timer = setTimeout(async () => {
    roundTimers.delete(gameId);
    try {
      const currentGame = await storage.getGame(channel.id);
      if (!currentGame || currentGame.id !== gameId || currentGame.status !== "judging") return;

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Time's Up!")
            .setDescription("The judge didn't pick in time. No winner this round. Moving on...")
            .setColor(0xFF6600)
        ]
      });

      const players = await storage.getPlayers(gameId);
      if (players.length < 2) return;
      const currentJudgeIndex = players.findIndex((p: any) => p.userId === currentGame.judgeId);
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
}

async function startRound(channel: any, gameId: number) {
  clearRoundTimer(gameId);
  await storage.updateGameStatus(gameId, "playing");
  const excludeIds = usedBlackCards.get(gameId) || [];
  let blackCard = await storage.getBlackCard(excludeIds);

  if (!blackCard) {
    usedBlackCards.delete(gameId);
    blackCard = await storage.getBlackCard();
    if (!blackCard) {
      await channel.send("Error: Out of black cards!");
      return;
    }
    usedBlackCards.set(gameId, [blackCard.id]);
  } else {
    excludeIds.push(blackCard.id);
    usedBlackCards.set(gameId, excludeIds);
  }

  await storage.setGameBlackCard(gameId, blackCard.id);

  const players = await storage.getPlayers(gameId);
  for (const p of players) {
    const hand = await storage.getHand(p.id);
    if (hand.length < HAND_SIZE) {
      const newCards = await storage.getWhiteCards(HAND_SIZE - hand.length);
      for (const card of newCards) {
        await storage.addToHand(p.id, card.id);
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
        .setTitle("New Round!")
        .setDescription(`**Judge:** <@${game?.judgeId}>\n\n## ${formatCardText(blackCard.text)}`)
        .setFooter({ text: "Click 'View Cards' to see your hand, then type a number to play! You have 60 seconds!" })
        .setColor(0x000000)
    ],
    components: [row]
  });

  const timer = setTimeout(async () => {
    roundTimers.delete(gameId);
    try {
      const currentGame = await storage.getGame(channel.id);
      if (!currentGame || currentGame.id !== gameId || currentGame.status !== "playing") return;

      const currentBlackCard = currentGame.currentBlackCardId ? await storage.getCard(currentGame.currentBlackCardId) : null;
      if (!currentBlackCard) return;

      const playedCards = await storage.getPlayedCards(gameId);
      if (playedCards.length > 0) {
        const allPlayers = await storage.getPlayers(gameId);
        const playedPlayerIds = new Set(playedCards.map(c => c.playerId));
        const submitted: string[] = [];
        const missed: string[] = [];
        for (const p of allPlayers) {
          if (p.userId === currentGame.judgeId) continue;
          const hand = await storage.getHand(p.id);
          if (hand.length === 0 && !playedPlayerIds.has(p.id)) continue;
          if (playedPlayerIds.has(p.id)) {
            submitted.push(p.username);
          } else {
            missed.push(p.username);
          }
        }
        const submittedText = submitted.length > 0 ? `**Submitted:** ${submitted.join(", ")}` : "";
        const missedText = missed.length > 0 ? `**Didn't make it:** ${missed.join(", ")}` : "";
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Time's Up!")
              .setDescription(`Not everyone played in time, but we'll move on with what we have.\n\n${submittedText}\n${missedText}`.trim())
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
        if (allPlayers.length < 2) return;
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
