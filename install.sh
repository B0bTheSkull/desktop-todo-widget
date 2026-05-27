#!/usr/bin/env bash
# Installs the desktop-todo-widget: data file + helper into ~/Documents/Dashboard,
# and the Übersicht widget into the Übersicht widgets folder.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$HOME/Documents/Dashboard"
WIDGET_DIR="$HOME/Library/Application Support/Übersicht/widgets"

echo "Installing desktop-todo-widget..."

mkdir -p "$DATA_DIR" "$WIDGET_DIR"

cp "$SRC/bin/todo.py" "$DATA_DIR/todo.py"
chmod +x "$DATA_DIR/todo.py"
echo "  • helper      -> $DATA_DIR/todo.py"

if [ -e "$DATA_DIR/todo.md" ]; then
  echo "  • data file   -> $DATA_DIR/todo.md (exists, left untouched)"
else
  cp "$SRC/examples/todo.md" "$DATA_DIR/todo.md"
  echo "  • data file   -> $DATA_DIR/todo.md (created from example)"
fi

cp -R "$SRC/widget/todo.widget" "$WIDGET_DIR/todo.widget"
echo "  • widget      -> $WIDGET_DIR/todo.widget"

echo
echo "Done. Open Übersicht to see it:  open -a \"Übersicht\""
if [ ! -d "/Applications/Übersicht.app" ]; then
  echo "Übersicht not found — install it first:  brew install --cask ubersicht"
fi
