const { Bot } = require('node-telegram-bot-api');
const User = require('../models/User');

let bot = null;
let ioInstance = null;

// Memory cache for keeping track of recent chat partners for Telegram replies
// Key: telegramChatId -> Value: { recipientId, recipientName, chatId }
const userRecentChatMap = new Map();

/**
 * Initialize Telegram Bot Service
 * @param {object} io - Socket.io server instance
 */
const initTelegramBot = (io) => {
  ioInstance = io;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token.trim() === '' || token.includes('YOUR_TELEGRAM')) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN not provided. Telegram Bot service disabled.');
    return;
  }

  try {
    bot = new Bot(token);
    setupBotHandlers();
    bot.startPolling();
    console.log(`🤖 Telegram Bot (@${process.env.TELEGRAM_BOT_NAME || 'Nrz8bot'}) service started.`);
  } catch (err) {
    console.error('❌ Failed to start Telegram Bot:', err.message);
  }
};

/**
 * Register command & message listeners on the Bot
 */
const setupBotHandlers = () => {
  if (!bot) return;

  // Catch errors
  bot.catch((err) => {
    console.error('⚠️ Telegram Bot Error:', err.message || err);
  });

  // Handle /start command (Token linking)
  bot.command('start', async (ctx) => {
    const chatId = String(ctx.chat.id);
    const token = ctx.match ? ctx.match.trim() : null;
    const username = ctx.from.username || ctx.from.first_name || 'User';

    if (!token) {
      // General /start without token
      const existingUser = await User.findOne({ telegramChatId: chatId });
      if (existingUser) {
        return ctx.reply(
          `👋 Welcome back, *${existingUser.name}*!\n\n` +
          `✅ Your Telegram account is linked with *Skill Exchange*.\n` +
          `You will receive live chat notifications & session updates right here.`,
          { parse_mode: 'Markdown' }
        );
      } else {
        return ctx.reply(
          `👋 Welcome to *Skill Exchange Bot*!\n\n` +
          `To link your account:\n` +
          `1. Go to your **Profile** page on Skill Exchange.\n` +
          `2. Click **Connect Telegram Bot**.\n\n` +
          `Or use the unique link generated in your profile settings!`,
          { parse_mode: 'Markdown' }
        );
      }
    }

    // Verify token provided in /start <token>
    try {
      const user = await User.findOne({ telegramConnectToken: token });
      if (!user) {
        return ctx.reply(
          `❌ *Invalid or Expired Token*\n\n` +
          `Please generate a new Telegram connection token from your Skill Exchange Profile.`,
          { parse_mode: 'Markdown' }
        );
      }

      // Link user account to Telegram chatId
      user.telegramChatId = chatId;
      user.telegramUsername = username;
      user.telegramConnectToken = null;
      user.telegramNotificationsEnabled = true;
      await user.save();

      console.log(`✅ User ${user.name} linked Telegram Chat ID: ${chatId}`);

      ctx.reply(
        `🎉 *Account Connected Successfully!*\n\n` +
        `Hello *${user.name}*, your Telegram account is now connected to Skill Exchange.\n\n` +
        `💬 *Features Enabled:*\n` +
        `• Instant Live Chat Notifications\n` +
        `• Quick Replies via Telegram\n` +
        `• Session Booking & Status Alerts`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error linking Telegram account:', err);
      ctx.reply('⚠️ An error occurred while linking your account. Please try again.');
    }
  });

  // Handle /status command
  bot.command('status', async (ctx) => {
    const chatId = String(ctx.chat.id);
    const user = await User.findOne({ telegramChatId: chatId });

    if (user) {
      ctx.reply(
        `⚙️ *Account Status*\n\n` +
        `👤 *Name:* ${user.name}\n` +
        `📧 *Email:* ${user.email}\n` +
        `🔔 *Notifications:* ${user.telegramNotificationsEnabled ? 'Enabled ✅' : 'Disabled ❌'}`,
        { parse_mode: 'Markdown' }
      );
    } else {
      ctx.reply('❌ No Skill Exchange account linked to this Telegram user.');
    }
  });

  // Handle /unlink command
  bot.command('unlink', async (ctx) => {
    const chatId = String(ctx.chat.id);
    const user = await User.findOne({ telegramChatId: chatId });

    if (user) {
      user.telegramChatId = null;
      user.telegramUsername = null;
      await user.save();

      ctx.reply('🔓 Your Telegram account has been unlinked from Skill Exchange.');
    } else {
      ctx.reply('ℹ️ No account linked.');
    }
  });

  // Handle /help command
  bot.command('help', (ctx) => {
    ctx.reply(
      `📌 *Skill Exchange Bot Commands:*\n\n` +
      `/start - Check status or connect account\n` +
      `/status - View linked profile details\n` +
      `/unlink - Disconnect Telegram from your account\n` +
      `/help - Show this help menu\n\n` +
      `💬 *Replying to Chat Messages:*\n` +
      `When you receive a chat notification from a user on Skill Exchange, simply type your reply here in Telegram and press send!`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle text messages (User replying via Telegram)
  bot.on('message:text', async (ctx) => {
    if (!ctx.msg.text || ctx.msg.text.startsWith('/')) return;

    const chatId = String(ctx.chat.id);

    try {
      const sender = await User.findOne({ telegramChatId: chatId });
      if (!sender) {
        return ctx.reply(
          '⚠️ Please link your account first by generating a link on Skill Exchange.'
        );
      }

      const recentChat = userRecentChatMap.get(chatId);
      if (!recentChat || !recentChat.recipientId) {
        return ctx.reply(
          `ℹ️ No active conversation context found.\n` +
          `Wait for a message from another user or initiate a chat on Skill Exchange platform first.`
        );
      }

      const msgData = {
        chatId: recentChat.chatId,
        senderId: String(sender._id),
        senderName: sender.name,
        receiverId: String(recentChat.recipientId),
        text: ctx.msg.text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'telegram'
      };

      console.log(`💬 Forwarding Telegram message from ${sender.name} to chat_${recentChat.chatId}: "${ctx.msg.text}"`);

      if (ioInstance) {
        ioInstance.to(`chat_${recentChat.chatId}`).emit('receive_message', msgData);
        ioInstance.to(`user_${recentChat.recipientId}`).emit('new_chat_notification', msgData);
      }

      ctx.reply(`✓ Delivered to *${recentChat.recipientName || 'user'}* on web app`, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('Error forwarding Telegram message:', err);
    }
  });
};

/**
 * Forward live web chat message to user's Telegram if linked
 */
const forwardChatMessageToTelegram = async (recipientId, senderUser, text, chatId) => {
  if (!bot) return;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.telegramChatId || !recipient.telegramNotificationsEnabled) {
      return;
    }

    const recipientTelegramId = recipient.telegramChatId;

    userRecentChatMap.set(recipientTelegramId, {
      recipientId: String(senderUser.id || senderUser._id),
      recipientName: senderUser.name,
      chatId
    });

    const telegramMessage =
      `💬 *New Chat Message*\n` +
      `From: *${senderUser.name}*\n\n` +
      `"${text}"\n\n` +
      `✍️ _Type a reply here to send back live!_`;

    bot.api.sendMessage(recipientTelegramId, telegramMessage, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to forward chat message to Telegram:', err.message);
  }
};

/**
 * Send general system notification to user's Telegram
 */
const sendTelegramNotification = async (userId, title, body) => {
  if (!bot) return;

  try {
    const user = await User.findById(userId);
    if (!user || !user.telegramChatId || !user.telegramNotificationsEnabled) return;

    const message = `🔔 *${title}*\n\n${body}`;
    bot.api.sendMessage(user.telegramChatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send Telegram notification:', err.message);
  }
};

module.exports = {
  initTelegramBot,
  forwardChatMessageToTelegram,
  sendTelegramNotification
};
