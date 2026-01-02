#!/bin/bash

# Helper script to run Groq models test
# Reads GROQ_API_KEY from .env file or accepts it as argument

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo ""
    echo "Create a .env file with:"
    echo "  GROQ_API_KEY=gsk_your_key_here"
    exit 1
fi

# If API key provided as argument, use that
if [ -n "$1" ]; then
    export GROQ_API_KEY="$1"
    echo "✅ Using API key from argument"
else
    # Load API key from .env file
    source .env

    if [ -z "$GROQ_API_KEY" ]; then
        echo "❌ Error: GROQ_API_KEY not found in .env file"
        echo ""
        echo "Add the following to your .env file:"
        echo "  GROQ_API_KEY=gsk_your_key_here"
        echo ""
        echo "Or pass it as argument:"
        echo "  ./test-groq-models.sh gsk_your_key_here"
        exit 1
    fi

    echo "✅ Loaded GROQ_API_KEY from .env file"
fi

echo "🧪 Running Groq models test..."
echo ""
npm run test:models

