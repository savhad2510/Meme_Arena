
# 🎭 Meme Arena

A revolutionary platform where meme culture meets blockchain betting on Mantle Network. Battle, bet, and conquer in the world of viral memes.

## 🚀 Features

- **Meme Battles**: Create and participate in viral meme competitions
- **Smart Betting**: Place bets on memes using Mantle Network
- **Real-time Chat**: Engage with other users during battles
- **Blockchain Integration**: Secure and transparent betting system on Mantle
- **Dynamic Battle System**: Create custom battles and invite participants
- **Low Gas Fees**: Leveraging Mantle Network's efficient infrastructure

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Real-time Database & Authentication)
- **Blockchain**: Mantle Network (EVM Compatible)
- **Smart Contracts**: Solidity, Foundry
- **Deployment**: Mantle Testnet (Chain ID: 421614)

## 🏃‍♂️ Getting Started

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
cd app
npm install
```

3. Set up environment variables
Create `.env.local` with Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

4. Run the development server
```bash
npm run dev
```

## 📁 Project Structure

```
app/
├── app/                  # Next.js app directory
│   ├── battles/         # Battle-related pages
│   ├── profile/         # User profile pages
│   └── chatroom/        # Real-time chat features
├── components/          # Reusable React components
├── contracts/           # Smart contracts
└── utils/              # Utility functions
```

## 🎮 How It Works

1. **Create or Join a Battle**
   - Select a meme template
   - Place your bet using Mantle Network
   - Share and promote your meme

2. **Track Progress**
   - Monitor real-time betting stats
   - Engage in community discussions
   - View leaderboard updates

3. **Win Rewards**
   - Winners determined by community voting
   - Automatic reward distribution via smart contracts
   - View battle history and earnings

## 🔗 Smart Contract Architecture

The platform uses two main smart contracts deployed on Mantle Testnet:
- `MemeBattle.sol`: Handles battle creation and betting management
- `User.sol`: Manages user profiles and statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
