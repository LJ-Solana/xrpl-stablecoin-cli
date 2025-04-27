# XRPL Stablecoin CLI 💵

A simple CLI tool to issue and manage stablecoins on the XRP Ledger (XRPL) 🌎✨.

Built with Node.js, `xrpl`, and `commander` for clean, fun XRPL ops. 🛠️

---

## ⚡ Features

- Create new wallets with QR code support 🆕
- Get current wallet information 📋
- Mint stablecoins to any address ✨
- Burn (redeem) stablecoins 🔥
- Send stablecoins to a wallet 🚚
- Check balances 📈
- Freeze misbehaving accounts ❄️

---

## 📦 Installation

Clone the repo and install globally:

```bash
git clone https://github.com/LJ-Solana/xrpl-stablecoin-cli.git
cd xrpl-stablecoin-cli
npm install -g .
# xrpl-stablecoin-cli

```

## 🚀 Usage

### Create a New Wallet
```bash
xrpl-stablecoin create-wallet
```
This will:
- Generate a new XRPL wallet
- Display the wallet address, seed, and public key
- Show a QR code for the wallet address
- Optionally fund the wallet with testnet XRP

### Get Current Wallet Information
```bash
xrpl-stablecoin get-wallet
```
This will:
- Display the current wallet's address and public key
- Show a QR code for the wallet address
- Display the current XRP balance

### Mint Stablecoins
```bash
xrpl-stablecoin mint
```
This will prompt you for:
1. Stablecoin symbol (e.g., USD, EUR, GBP)
2. Amount to mint
3. Whether to generate a new wallet for the destination (default: yes)

If you choose to generate a new wallet, it will:
- Create a new XRPL wallet
- Display the new address and seed
- Fund it with testnet XRP
- Set up the trust line
- Mint the stablecoins to it

If you choose to use an existing wallet, you'll need to provide:
- The destination address
- The destination wallet's seed (for trust line setup)

After successful minting, you'll receive:
- A clickable link to view the transaction on the XRPL testnet explorer
- The ledger index where the transaction was recorded

### Other Commands
```bash
# Burn stablecoins
xrpl-stablecoin burn <amount>

# Send stablecoins
xrpl-stablecoin send <amount> <address>

# Check balance
xrpl-stablecoin balance <address>

# Freeze an account
xrpl-stablecoin freeze <address>
```

---

## 🔧 Configuration

Create a `.env` file in the project root with your XRPL node configuration:

```env
XRPL_NODE=wss://s.altnet.rippletest.net:51233
ISSUER_SECRET=your_wallet_seed_here
```
