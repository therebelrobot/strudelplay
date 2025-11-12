#!/bin/bash

# Cleanup script to kill any lingering processes

echo "🧹 Cleaning up lingering processes..."

# Kill process on port 5555 (sampler)
PORT_5555=$(lsof -ti:5555)
if [ ! -z "$PORT_5555" ]; then
  echo "Killing process on port 5555..."
  kill -9 $PORT_5555 2>/dev/null
  echo "✓ Port 5555 freed"
else
  echo "Port 5555 is already free"
fi

# Kill process on port 8000 (samples server)
PORT_8000=$(lsof -ti:8000)
if [ ! -z "$PORT_8000" ]; then
  echo "Killing process on port 8000..."
  kill -9 $PORT_8000 2>/dev/null
  echo "✓ Port 8000 freed"
else
  echo "Port 8000 is already free"
fi

# Kill any node processes running the sampler or serve
echo "Killing sampler and serve processes..."
pkill -f "@strudel/sampler" 2>/dev/null
pkill -f "serve.*samples" 2>/dev/null

# Kill MCP server processes
echo "Killing MCP server processes..."
pkill -f "mcp-server/dist/index.js" 2>/dev/null
pkill -f "strudel-mcp" 2>/dev/null

# Kill Chromium/Playwright browser instances
echo "Killing browser processes..."
pkill -f "chromium.*strudel" 2>/dev/null
pkill -f "playwright" 2>/dev/null
pkill -f "chrome.*--headless" 2>/dev/null

# Kill any tsx processes running our scripts
echo "Killing watcher processes..."
pkill -f "tsx.*watcher" 2>/dev/null
pkill -f "tsx.*test-mcp" 2>/dev/null

echo "✓ Cleanup complete!"