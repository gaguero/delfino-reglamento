/**
 * Telegram Bridge Bot for Claude Code
 *
 * This bot receives messages from Telegram and saves them to a file
 * that Claude can monitor and execute.
 */

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_ID = process.env.TELEGRAM_USER_ID; // Your Telegram user ID
const COMMANDS_FILE = path.join(__dirname, 'commands.txt');
const RESPONSES_FILE = path.join(__dirname, 'responses.txt');

if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

if (!ALLOWED_USER_ID) {
  console.error('Error: TELEGRAM_USER_ID not set');
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram Bridge Bot started!');
console.log(`📝 Commands will be written to: ${COMMANDS_FILE}`);
console.log(`📤 Responses will be read from: ${RESPONSES_FILE}`);
console.log(`🔐 Authorized user ID: ${ALLOWED_USER_ID}`);

// Initialize files
if (!fs.existsSync(COMMANDS_FILE)) {
  fs.writeFileSync(COMMANDS_FILE, '');
}
if (!fs.existsSync(RESPONSES_FILE)) {
  fs.writeFileSync(RESPONSES_FILE, '');
}

// Track last response position
let lastResponsePosition = 0;

// Listen for messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const text = msg.text;

  console.log(`📩 Message from ${msg.from.first_name} (${userId}): ${text}`);

  // Security check
  if (userId !== ALLOWED_USER_ID) {
    await bot.sendMessage(chatId, '🚫 Unauthorized. This bot is private.');
    console.log(`⚠️  Unauthorized access attempt from ${userId}`);
    return;
  }

  // Handle bot commands
  if (text.startsWith('/start')) {
    await bot.sendMessage(
      chatId,
      '👋 Welcome to Claude Code Remote Bridge!\n\n' +
      '📱 Send me any message and Claude will receive it.\n' +
      '🤖 Claude will execute your commands and send responses back.\n\n' +
      'Commands:\n' +
      '/status - Check connection status\n' +
      '/clear - Clear command queue\n' +
      '/help - Show this message'
    );
    return;
  }

  if (text === '/status') {
    const commandsExist = fs.existsSync(COMMANDS_FILE);
    const responsesExist = fs.existsSync(RESPONSES_FILE);
    await bot.sendMessage(
      chatId,
      `✅ Bot Status: Running\n` +
      `📝 Commands file: ${commandsExist ? 'Ready' : 'Missing'}\n` +
      `📤 Responses file: ${responsesExist ? 'Ready' : 'Missing'}\n` +
      `🔗 Connection: Active`
    );
    return;
  }

  if (text === '/clear') {
    fs.writeFileSync(COMMANDS_FILE, '');
    await bot.sendMessage(chatId, '🗑️ Command queue cleared!');
    return;
  }

  if (text === '/help') {
    await bot.sendMessage(
      chatId,
      '📖 How to use:\n\n' +
      '1. Send any message to this bot\n' +
      '2. Claude receives it in the CLI\n' +
      '3. Claude executes your command\n' +
      '4. You get the response here\n\n' +
      'Examples:\n' +
      '- "Create a new component"\n' +
      '- "Deploy to Railway"\n' +
      '- "Check git status"\n' +
      '- "Update the README"'
    );
    return;
  }

  // Write command to file for Claude to read
  const timestamp = new Date().toISOString();
  const command = `[${timestamp}] ${text}\n`;

  fs.appendFileSync(COMMANDS_FILE, command);

  await bot.sendMessage(
    chatId,
    '✅ Command sent to Claude!\n' +
    '⏳ Waiting for response...\n\n' +
    `📝 Your command: "${text}"`
  );

  console.log(`✅ Command written to file: ${text}`);
});

// Monitor responses file and send back to Telegram
function watchResponses() {
  setInterval(() => {
    if (!fs.existsSync(RESPONSES_FILE)) return;

    const content = fs.readFileSync(RESPONSES_FILE, 'utf8');

    if (content.length > lastResponsePosition) {
      const newContent = content.substring(lastResponsePosition);
      lastResponsePosition = content.length;

      if (newContent.trim()) {
        bot.sendMessage(ALLOWED_USER_ID, `🤖 Claude says:\n\n${newContent}`);
        console.log(`📤 Response sent to Telegram: ${newContent.substring(0, 50)}...`);
      }
    }
  }, 2000); // Check every 2 seconds
}

watchResponses();

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bot shutting down...');
  bot.stopPolling();
  process.exit(0);
});
