import { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { storage } from "./storage";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const HAND_SIZE = 7;

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help for the Cards Against Humanity bot'),
  new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join the game in this channel'),
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start the game (needs 3+ players)'),
  new SlashCommandBuilder()
    .setName('hand')
    .setDescription('View your current hand (sent via DM)'),
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

    await client.login(process.env.DISCORD_TOKEN);
    console.log(`Logged in as ${client.user?.tag}!`);
  } catch (error) {
    console.error("Failed to login or register commands:", error);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'view_hand') {
      const game = await storage.getGame(interaction.channelId!);
      if (!game) {
        return interaction.reply({ content: "No active game in this channel.", ephemeral: true });
      }
      const player = await storage.getPlayer(game.id, interaction.user.id);
      if (!player) {
        return interaction.reply({ content: "You are not in the game. Use /join to participate!", ephemeral: true });
      }

      const blackCard = await storage.getCard(game.currentBlackCardId || 0);
      const hand = await storage.getHand(player.id);
      const description = hand.map((c, i) => `**${i + 1}.** ${c.text}`).join("\n");

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Your Hand")
            .setDescription(`**Current Black Card:** ${blackCard?.text || "None"}\n\n${description || "Empty hand."}\n\nUse \`/pick <number>\` in the channel to play.`)
            .setColor(0x2F3136)
        ],
        ephemeral: true
      });
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
          .setDescription("Slash Commands:")
          .addFields(
            { name: "/join", value: "Join the game in this channel" },
            { name: "/start", value: "Start the game (needs 3+ players)" },
            { name: "/hand", value: "View your current hand (DM)" },
            { name: "/pick <number>", value: "Pick a card from your hand" },
            { name: "/judge <number>", value: "Judge the winner (Judge only)" },
            { name: "/score", value: "Show current scores" },
            { name: "/leave", value: "Leave the game" }
          )
          .setColor(0x00AE86)
      ]
    });
  }

  if (commandName === "join") {
    let game = await storage.getGame(channelId!);
    if (!game) {
      game = await storage.createGame(guildId!, channelId!);
      await interaction.reply("New game created! Waiting for players...");
    } else if (game.status !== "waiting") {
      await interaction.reply({ content: "Game is already in progress!", ephemeral: true });
      return;
    }

    const player = await storage.getPlayer(game.id, user.id);
    if (player) {
      await interaction.reply({ content: "You are already in the game!", ephemeral: true });
      return;
    }

    await storage.addPlayer(game.id, user.id, user.username, false);
    await interaction.reply(`${user.username} joined the game!`);
  }

  if (commandName === "start") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No game found. Type /join to create one.", ephemeral: true });
      return;
    }
    if (game.status !== "waiting") {
      await interaction.reply({ content: "Game already started.", ephemeral: true });
      return;
    }

    const players = await storage.getPlayers(game.id);
    if (players.length < 3) {
      await interaction.reply(`Need at least 3 players to start. Currently have ${players.length}.`);
      return;
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

    const played = await storage.getPlayedCards(game.id);
    if (played.find(p => p.playerId === player.id)) {
      await interaction.reply({ content: "You have already played a card this round.", ephemeral: true });
      return;
    }

    const index = options.getInteger('number')! - 1;
    const hand = await storage.getHand(player.id);

    if (isNaN(index) || index < 0 || index >= hand.length) {
      await interaction.reply({ content: "Invalid card number. Check your hand with /hand.", ephemeral: true });
      return;
    }

    const selectedCard = hand[index];
    await storage.playCard(game.id, player.id, selectedCard.id);
    await storage.removeFromHand(player.id, selectedCard.id);

    await interaction.reply({ content: `You played: ${selectedCard.text}`, ephemeral: true });
    await interaction.channel?.send(`${user.username} has played a card!`);

    const players = await storage.getPlayers(game.id);
    const totalPlayersToPlay = players.length - 1;
    const currentlyPlayed = await storage.getPlayedCards(game.id);

    if (currentlyPlayed.length >= totalPlayersToPlay) {
      await storage.updateGameStatus(game.id, "judging");
      const cardList = currentlyPlayed.map((c, i) => `**${i + 1}.** ${c.text}`).join("\n");
      
      const blackCard = await storage.getCard(game.currentBlackCardId!);
      await interaction.channel?.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("All cards are in!")
            .setDescription(`**Judge:** <@${game.judgeId}>\n\n**Black Card:** ${blackCard?.text}\n\n**Options:**\n${cardList}\n\nJudge, pick the winner with \`/judge <number>\``)
            .setColor(0x00FF00)
        ]
      });
    }
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

    const index = options.getInteger('number')! - 1;
    const playedCards = await storage.getPlayedCards(game.id);
    
    if (isNaN(index) || index < 0 || index >= playedCards.length) {
      await interaction.reply({ content: "Invalid selection.", ephemeral: true });
      return;
    }

    const winnerCard = playedCards[index];
    const winner = await storage.incrementScore(winnerCard.playerId);
    
    await interaction.reply(`Selected winner: ${winner.username}`);
    
    const blackCard = game.currentBlackCardId ? await storage.getCard(game.currentBlackCardId) : null;
    await interaction.channel?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Winner Selected!")
          .setDescription(`**${winner.username}** wins the round!\n\n**Black Card:** ${blackCard?.text || ""}\n**Winning Card:** "${winnerCard.text}"`)
          .setColor(0xFFD700)
      ]
    });

    const players = await storage.getPlayers(game.id);
    const currentJudgeIndex = players.findIndex(p => p.userId === game.judgeId);
    const nextJudge = players[(currentJudgeIndex + 1) % players.length];
    await storage.setGameJudge(game.id, nextJudge.userId);

    await storage.clearPlayedCards(game.id);
    await startRound(interaction.channel, game.id);
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
  
  if (commandName === "hand") {
    const game = await storage.getGame(channelId!);
    if (!game) {
      await interaction.reply({ content: "No active game.", ephemeral: true });
      return;
    }
    const player = await storage.getPlayer(game.id, user.id);
    if (!player) {
      await interaction.reply({ content: "You are not in the game.", ephemeral: true });
      return;
    }
    
    const blackCard = await storage.getCard(game.currentBlackCardId || 0);
    const hand = await storage.getHand(player.id);
    const description = hand.map((c, i) => `**${i + 1}.** ${c.text}`).join("\n");
    
    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Your Hand")
          .setDescription(`**Current Black Card:** ${blackCard?.text || "None"}\n\n${description || "Empty hand."}\n\nUse \`/pick <number>\` in the channel to play.`)
      ]
    }).then(() => interaction.reply({ content: "Check your DMs for your hand!", ephemeral: true }))
      .catch(() => interaction.reply({ content: "I couldn't DM you! Please enable DMs from server members.", ephemeral: true }));
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === ChannelType.DM) {
    await message.reply("Please use slash commands (e.g., `/pick`, `/join`) in a server channel to play.");
  }
});

async function startRound(channel: any, gameId: number) {
  await storage.updateGameStatus(gameId, "playing");
  const blackCard = await storage.getBlackCard();
  
  if (!blackCard) {
    await channel.send("Error: Out of black cards!");
    return;
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
    );

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("New Round!")
        .setDescription(`**Judge:** ${judgePlayer?.username}\n\n**Black Card:**\n${blackCard.text}`)
        .setFooter({ text: "Click 'View Cards' to see your hand and play!" })
        .setColor(0x000000)
    ],
    components: [row]
  });
}
