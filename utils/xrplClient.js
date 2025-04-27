const { Client, Wallet } = require('xrpl');
require('dotenv').config();

const client = new Client(process.env.RPC_URL);
const wallet = Wallet.fromSeed(process.env.ISSUER_SECRET);

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

module.exports = {
  client,
  wallet,
  connect,
  disconnect,
};
