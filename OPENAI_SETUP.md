# OpenAI Integration Setup for BrutusAI

## Overview
BuckeyeGrub now includes OpenAI-powered chat functionality for BrutusAI, providing intelligent nutrition assistance for OSU students.

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment Variables

Create a `.env` file in the root directory (`BuckeyeGrub/.env`) with:

```bash
# OpenAI Configuration
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run web
```

## Features

### With API Key Configured:
- ✅ Real OpenAI ChatGPT responses
- ✅ Contextual conversation memory
- ✅ OSU-specific nutrition guidance
- ✅ Smart dining plan recommendations

### Without API Key (Demo Mode):
- ✅ Fallback responses for common questions
- ✅ Basic nutrition guidance
- ✅ OSU dining location information
- ⚠️ Limited conversation context

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your API key** to version control
2. **Add `.env` to `.gitignore`**
3. **Use environment variables** in production
4. **Monitor API usage** to control costs
5. **Rotate keys periodically** for security

## Cost Management

- OpenAI charges per token used
- GPT-3.5-turbo costs ~$0.002 per 1K tokens
- Average conversation: 100-500 tokens
- Estimated cost: $0.0002 - $0.001 per message

## Troubleshooting

### API Key Not Working:
1. Verify the key starts with `sk-`
2. Check for extra spaces or characters
3. Ensure the key is active on OpenAI platform
4. Restart the development server

### Network Issues:
- Check internet connection
- Verify OpenAI service status
- Try again in a few moments

### Fallback Mode:
If the API fails, BrutusAI automatically falls back to local responses to ensure the app continues working.

## Development Notes

The OpenAI service is located in `src/services/openai.ts` and includes:
- Custom system prompt for OSU context
- Error handling and fallbacks
- Conversation memory management
- Token optimization

For production deployment, consider:
- Server-side API proxy for security
- Rate limiting and usage monitoring
- Caching frequently asked questions
- User session management 