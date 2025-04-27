const { Client, Wallet } = require('xrpl');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client(process.env.XRPL_NODE || 'wss://s.altnet.rippletest.net:51233');

// Initialize wallet from wallet.json if it exists
let wallet = null;
const walletPath = path.join(process.cwd(), 'wallet.json');
if (fs.existsSync(walletPath)) {
  try {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    wallet = Wallet.fromSeed(walletData.seed);
  } catch (error) {
    console.error('Error loading wallet:', error);
  }
}

async function connect() {
  if (!client.isConnected()) {
    await client.connect();
  }
}

async function disconnect() {
  if (client.isConnected()) {
    await client.disconnect();
  }
}

function getWallet(seed) {
  if (seed) {
    return Wallet.fromSeed(seed);
  }
  return wallet;
}

module.exports = {
  client,
  wallet,
  getWallet,
  connect,
  disconnect,
};
