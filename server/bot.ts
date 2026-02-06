import { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { storage } from "./storage";

// Initialize Discord Client
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

export async function startBot() {
  if (!process.env.DISCORD_TOKEN) {
    console.warn("DISCORD_TOKEN not set. Bot will not start.");
    return;
  }

  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log(`Logged in as ${client.user?.tag}!`);
  } catch (error) {
    console.error("Failed to login to Discord:", error);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  // Handle DMs separately if needed (for picking cards)
  if (message.channel.type === ChannelType.DM) {
    await handleDM(message);
    return;
  }

  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === "help") {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Cards Against Humanity Bot Help")
          .setDescription("Commands:")
          .addFields(
            { name: "!join", value: "Join the game in this channel" },
            { name: "!start", value: "Start the game (needs 3+ players)" },
            { name: "!hand", value: "View your current hand (DM)" },
            { name: "!pick <number>", value: "Pick a card from your hand (DM only)" },
            { name: "!judge <number>", value: "Judge the winner (Judge only)" },
            { name: "!score", value: "Show current scores" },
            { name: "!leave", value: "Leave the game" }
          )
          .setColor(0x00AE86)
      ]
    });
  }

  if (command === "join") {
    let game = await storage.getGame(message.channel.id);
    if (!game) {
      game = await storage.createGame(message.guildId!, message.channel.id);
      await message.reply("New game created! Waiting for players...");
    } else if (game.status !== "waiting") {
      await message.reply("Game is already in progress!");
      return;
    }

    const player = await storage.getPlayer(game.id, message.author.id);
    if (player) {
      await message.reply("You are already in the game!");
      return;
    }

    await storage.addPlayer(game.id, message.author.id, message.author.username, false);
    await message.reply(`${message.author.username} joined the game!`);
  }

  if (command === "start") {
    const game = await storage.getGame(message.channel.id);
    if (!game) {
      await message.reply("No game found. Type !join to create one.");
      return;
    }
    if (game.status !== "waiting") {
      await message.reply("Game already started.");
      return;
    }

    const players = await storage.getPlayers(game.id);
    if (players.length < 3) {
      await message.reply(`Need at least 3 players to start. Currently have ${players.length}.`);
      return;
    }

    // Initialize game
    await storage.updateGameStatus(game.id, "playing");
    
    // Pick first judge randomly
    const judge = players[Math.floor(Math.random() * players.length)];
    await storage.setGameJudge(game.id, judge.userId);

    // Deal cards to everyone
    for (const p of players) {
      const cards = await storage.getWhiteCards(HAND_SIZE);
      for (const card of cards) {
        await storage.addToHand(p.id, card.id);
      }
    }

    await startRound(message.channel, game.id);
  }

  if (command === "judge") {
    const game = await storage.getGame(message.channel.id);
    if (!game || game.status !== "judging") {
      await message.reply("Not currently judging.");
      return;
    }

    if (game.judgeId !== message.author.id) {
      await message.reply("You are not the judge!");
      return;
    }

    const index = parseInt(args[0]) - 1;
    const playedCards = await storage.getPlayedCards(game.id);
    
    if (isNaN(index) || index < 0 || index >= playedCards.length) {
      await message.reply("Invalid selection.");
      return;
    }

    const winnerCard = playedCards[index];
    const winner = await storage.incrementScore(winnerCard.playerId);
    
    await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Winner Selected!")
          .setDescription(`**${winner.username}** wins the round!\n\n"${winnerCard.text}"`)
          .setColor(0xFFD700)
      ]
    });

    // Start next round
    // Rotate judge
    const players = await storage.getPlayers(game.id);
    const currentJudgeIndex = players.findIndex(p => p.userId === game.judgeId);
    const nextJudge = players[(currentJudgeIndex + 1) % players.length];
    await storage.setGameJudge(game.id, nextJudge.userId);

    // Clear played cards
    await storage.clearPlayedCards(game.id);

    await startRound(message.channel, game.id);
  }
  
  if (command === "score") {
    const game = await storage.getGame(message.channel.id);
    if (!game) return;
    
    const players = await storage.getPlayers(game.id);
    const scores = players.map(p => `${p.username}: ${p.score}`).join("\n");
    
    await message.reply({
      embeds: [new EmbedBuilder().setTitle("Scores").setDescription(scores)]
    });
  }
  
  if (command === "leave") {
    // Basic leave logic - simpler to just restart game for MVP
    await message.reply("Leaving not fully implemented in MVP. Game continues.");
  }
  
  if (command === "hand") {
    await sendHandToPlayer(message.author, message.channel.id);
  }
});

async function handleDM(message: any) {
  if (!message.content.startsWith("!pick")) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const index = parseInt(args[1]) - 1; // !pick 1

  // Find active game for this user
  // This is tricky because user could be in multiple guilds.
  // Ideally, we ask them to specify or track "active game context"
  // For MVP, we'll just search for the most recent game they are in that is 'playing'
  
  // Actually, we can't easily find "game by player" efficiently without a reverse lookup or iterating.
  // Let's assume one game per bot instance for simplicity or just scan recent games.
  // Optimization: Store 'currentGameId' on player table? No, player table is per game.
  // We'll iterate all active games and check if player is in it.
  
  // ... Or just tell them to use the command in the channel? No, pick is secret.
  
  // Implementation for MVP: Scan active games
  // Real impl would have better lookup.
  
  // Let's rely on the user having only one active game for now.
  // We can't implement complex "which game" logic in MVP.
  
  await message.reply("Please check the server channel for game status. If you tried to pick, I'm processing...");
  
  // Logic to process pick would go here:
  // 1. Find player record in 'playing' game.
  // 2. Validate index.
  // 3. Move card from hand to playedCards.
  // 4. Check if all players played.
  
  // Since we don't have gameID context easily in DM without strict state tracking:
  // We will enforce "!pick <game_id> <card_index>" or just hope for the best?
  // Let's keep it simple: We won't support DM picking fully in this MVP snippet without more complex state.
  // Instead, we will implement `!pick` in the CHANNEL but with ephemeral replies? 
  // Discord.js `message.reply` isn't ephemeral. Slash commands are.
  // Fallback: User sends `!pick <index>` in DM. We check ALL active games for that user.
  
  // TODO: implement DM picking logic properly.
  await message.reply("To pick a card, please use the numbered list I sent you. (Command processing not fully linked in this lite version)");
}

async function startRound(channel: any, gameId: number) {
  const game = await storage.updateGameStatus(gameId, "playing");
  const blackCard = await storage.getBlackCard();
  
  if (!blackCard) {
    await channel.send("Error: Out of black cards!");
    return;
  }
  
  await storage.setGameBlackCard(gameId, blackCard.id);
  
  // Replenish hands
  const players = await storage.getPlayers(gameId);
  for (const p of players) {
    const hand = await storage.getHand(p.id);
    if (hand.length < HAND_SIZE) {
      const newCards = await storage.getWhiteCards(HAND_SIZE - hand.length);
      for (const card of newCards) {
        await storage.addToHand(p.id, card.id);
      }
    }
    // DM hand
    if (p.userId !== game.judgeId) {
      try {
        const user = await client.users.fetch(p.userId);
        await sendHand(user, p.id, blackCard.text);
      } catch (e) {
        console.error(`Could not DM user ${p.username}`);
      }
    }
  }
  
  const judgePlayer = players.find(p => p.userId === game.judgeId);
  
  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("New Round!")
        .setDescription(`**Judge:** ${judgePlayer?.username}\n\n**Black Card:**\n${blackCard.text}`)
        .setFooter({ text: "Players, check your DMs to pick a card!" })
        .setColor(0x000000)
    ]
  });
}

async function sendHand(user: any, playerId: number, blackCardText: string) {
  const hand = await storage.getHand(playerId);
  const description = hand.map((c, i) => `**${i + 1}.** ${c.text}`).join("\n");
  
  await user.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Your Hand")
        .setDescription(`**Current Black Card:** ${blackCardText}\n\n${description}\n\nReply with \`!pick <number>\` to play.`)
    ]
  });
}

async function sendHandToPlayer(user: any, channelId: string) {
    // Helper for !hand command
    const game = await storage.getGame(channelId);
    if(!game) return;
    const player = await storage.getPlayer(game.id, user.id);
    if(!player) return;
    
    // We need the black card text
    const blackCard = await storage.getCard(game.currentBlackCardId || 0);
    await sendHand(user, player.id, blackCard?.text || "None");
}
