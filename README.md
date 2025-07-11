# Weave App

A cultural discovery and conversation app built with Next.js, Supabase, and Claude AI.

## Features

- **Magic Link Authentication**: Secure, passwordless authentication using Supabase
- **Persistent Chat History**: All conversations are saved and persist across sessions
- **AI-Powered Conversations**: Chat with Claude AI about your cultural discoveries
- **Scrap Management**: Save and organize quotes, thoughts, and images

## Chat History Persistence

The app automatically saves all chat conversations to the database, allowing users to:
- Continue conversations across different sessions
- Access their full chat history when they return
- Clear conversations when needed
- Maintain separate chat histories for each scrap

### How it works:
1. When a user opens a chat for a scrap, the app loads any existing conversation history
2. Each new message is automatically saved to the database
3. Chat history is tied to both the user and the specific scrap
4. Users can clear conversations using the trash icon in the chat header

## Getting Started

### Environment Setup

1. **Copy the environment template**:
   ```bash
   cp env.template .env.local
   ```

2. **Fill in your environment variables** in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude AI

3. **Get your credentials**:
   - **Supabase**: Go to [app.supabase.com](https://app.supabase.com) → Your Project → Settings → API
   - **Anthropic**: Go to [console.anthropic.com](https://console.anthropic.com) → Get API Keys

### Running the App

The app includes automatic environment validation that will check for all required variables on startup.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

If any required environment variables are missing, you'll see a helpful error message with setup instructions.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
