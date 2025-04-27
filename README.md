# XRPL Stablecoin CLI 💵

A simple CLI tool to issue and manage stablecoins on the XRP Ledger (XRPL) 🌎✨.

Built with Node.js, `xrpl`, and `commander` for clean, fun XRPL ops. 🛠️

---

## ⚡ Features

- Create new wallets with QR code support 🆕
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

### Other Commands
```bash
# Mint stablecoins
xrpl-stablecoin mint <amount> <destination>

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
```
