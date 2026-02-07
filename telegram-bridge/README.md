# Telegram Bridge for Claude Code

Control Claude Code remotely via Telegram! Send messages from anywhere and Claude receives them here in the CLI session.

## How It Works

```
You (Telegram) → Bot → commands.txt → Claude (reads) → executes → responses.txt → Bot → You
```

1. You send a message to the Telegram bot
2. Bot writes it to `commands.txt`
3. Claude monitors and reads new commands
4. Claude executes your instructions
5. Claude writes responses to `responses.txt`
6. Bot reads responses and sends back to you

## Setup (5 minutes)

### Step 1: Create Your Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name: `Claude Code Assistant`
4. Choose a username: `your_claude_code_bot` (must end in 'bot')
5. Copy the **token** you receive (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Telegram User ID

1. Message [@userinfobot](https://t.me/userinfobot)
2. It will reply with your user ID (a number like: `123456789`)
3. Copy this number

### Step 3: Configure the Bot

```bash
cd telegram-bridge

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
notepad .env
```

Add your credentials:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_USER_ID=123456789
```

### Step 4: Start the Bot

```bash
npm start
```

You should see:
```
🤖 Telegram Bridge Bot started!
📝 Commands will be written to: commands.txt
📤 Responses will be read from: responses.txt
🔐 Authorized user ID: 123456789
```

### Step 5: Test It!

1. Open Telegram
2. Search for your bot username
3. Send `/start`
4. Send a test message: `hello`

The bot should confirm the message was sent to Claude!

## Usage

### From Telegram

Just send normal messages to your bot:

```
"check git status"
"create a new component for user profiles"
"deploy to railway"
"what's the current project status?"
```

### Bot Commands

- `/start` - Welcome message
- `/status` - Check bot status
- `/clear` - Clear command queue
- `/help` - Show help

## How Claude Monitors Commands

I'll periodically check the `commands.txt` file for new instructions:

```bash
# In the main Claude Code session, I'll run:
cat telegram-bridge/commands.txt

# Read new commands and execute them
# Write responses to responses.txt
```

## Security

- ✅ Only YOUR Telegram user ID can send commands
- ✅ Bot token is private (never commit .env)
- ✅ Commands are written to local files only
- ✅ No external database or cloud storage

## Workflow Example

**You (from phone):**
> "Create a new page for editing annotations"

**Bot:**
> ✅ Command sent to Claude!
> ⏳ Waiting for response...

**Claude (here in CLI):**
> *Reads command, creates the file*
> *Writes response to responses.txt*

**Bot (to you):**
> 🤖 Claude says:
>
> Created app/admin/annotations/edit/page.tsx
> The page includes a form with TipTap editor
> Ready to test at /admin/annotations/edit

## Troubleshooting

**Bot not responding:**
- Check `npm start` is running
- Verify TELEGRAM_BOT_TOKEN is correct
- Make sure you used `/start` first

**"Unauthorized" error:**
- Check TELEGRAM_USER_ID matches your ID
- Get your ID from @userinfobot

**Commands not reaching Claude:**
- Check `commands.txt` exists
- Verify file permissions
- Ensure bot process is running

## Files

- `bot.js` - Main bot script
- `commands.txt` - Queue of commands from Telegram
- `responses.txt` - Responses from Claude
- `.env` - Your credentials (private)
- `package.json` - Dependencies

## Advanced: Run in Background

### Windows (with PM2):
```bash
npm install -g pm2
pm2 start bot.js --name telegram-bridge
pm2 save
pm2 startup
```

### Linux/Mac:
```bash
# Using screen
screen -S telegram-bot
npm start
# Press Ctrl+A then D to detach

# To reattach:
screen -r telegram-bot
```

## Tips

- Keep the bot running in a separate terminal
- Commands are queued if Claude is busy
- Use descriptive commands for better results
- Check `/status` regularly to ensure connection

## Example Conversation

```
You: check the database schema
Bot: ✅ Command sent to Claude!

Bot: 🤖 Claude says:
The database has 8 tables:
- users (authentication)
- articulos (articles)
- anotaciones (annotations)
... [full response]

You: create a migration for a new field
Bot: ✅ Command sent to Claude!

Bot: 🤖 Claude says:
Created migration: add_is_published_to_articulos
Run: npx prisma migrate dev
```

## Support

If you have issues:
1. Check bot is running: `ps aux | grep bot.js`
2. Check logs in terminal
3. Verify .env configuration
4. Test with `/status` command

---

**Now you can work on the project from anywhere!** 🚀📱
