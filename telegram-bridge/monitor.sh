#!/bin/bash

# Monitor script for Claude to watch Telegram commands
# This script runs in the background and helps Claude respond to Telegram messages

COMMANDS_FILE="commands.txt"
RESPONSES_FILE="responses.txt"
LAST_POSITION=0

echo "🔍 Monitoring Telegram commands..."
echo "📝 Commands file: $COMMANDS_FILE"
echo "📤 Responses file: $RESPONSES_FILE"
echo ""

while true; do
  if [ -f "$COMMANDS_FILE" ]; then
    CURRENT_SIZE=$(stat -c%s "$COMMANDS_FILE" 2>/dev/null || stat -f%z "$COMMANDS_FILE" 2>/dev/null || echo "0")

    if [ "$CURRENT_SIZE" -gt "$LAST_POSITION" ]; then
      # New commands available
      NEW_COMMANDS=$(tail -c +$((LAST_POSITION + 1)) "$COMMANDS_FILE")

      if [ -n "$NEW_COMMANDS" ]; then
        echo "📩 New command from Telegram:"
        echo "$NEW_COMMANDS"
        echo "---"
      fi

      LAST_POSITION=$CURRENT_SIZE
    fi
  fi

  sleep 2
done
