#!/bin/bash

# Stop Script for Codex Metatron Platform

echo "🛑 Stopping Codex Metatron Platform..."

STOPPED_COUNT=0

# Stop core server
if [ -f ".core-server.pid" ]; then
    CORE_PID=$(cat .core-server.pid)
    if kill -0 $CORE_PID 2>/dev/null; then
        kill $CORE_PID
        echo "✅ Core API Server stopped (PID: $CORE_PID)"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        echo "⚠️  Core API Server was not running"
    fi
    rm .core-server.pid
fi

# Stop pharaoh app
if [ -f ".pharaoh-app.pid" ]; then
    PHARAOH_PID=$(cat .pharaoh-app.pid)
    if kill -0 $PHARAOH_PID 2>/dev/null; then
        kill $PHARAOH_PID
        echo "✅ Pharaoh Admin App stopped (PID: $PHARAOH_PID)"
        STOPPED_COUNT=$((STOPPED_COUNT + 1))
    else
        echo "⚠️  Pharaoh Admin App was not running"
    fi
    rm .pharaoh-app.pid
fi

# Kill any remaining processes on the ports
CORE_PORT=${PORT:-3000}
PHARAOH_PORT=5173

# Kill processes on core server port
CORE_PIDS=$(lsof -ti:$CORE_PORT)
if [ ! -z "$CORE_PIDS" ]; then
    echo "🔄 Killing remaining processes on port $CORE_PORT..."
    echo $CORE_PIDS | xargs kill -9 2>/dev/null
fi

# Kill processes on pharaoh app port
PHARAOH_PIDS=$(lsof -ti:$PHARAOH_PORT)
if [ ! -z "$PHARAOH_PIDS" ]; then
    echo "🔄 Killing remaining processes on port $PHARAOH_PORT..."
    echo $PHARAOH_PIDS | xargs kill -9 2>/dev/null
fi

if [ $STOPPED_COUNT -eq 0 ]; then
    echo "ℹ️  Platform was not running"
else
    echo "👋 Platform stopped successfully ($STOPPED_COUNT services)"
fi