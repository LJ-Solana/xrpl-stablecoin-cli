#!/usr/bin/env node
const { Command } = require('commander');
const mint = require('./commands/mint');
const burn = require('./commands/burn');
const send = require('./commands/send');
const balance = require('./commands/balance');
const freeze = require('./commands/freeze');
const createWallet = require('./commands/create-wallet');

const program = new Command();

program
  .name('XRPL Stablecoin CLI 💵')
  .description('A CLI tool to issue and manage stablecoins on the XRPL 🌎')
  .version('1.0.0');

program
  .command('create-wallet')
  .description('Create a new wallet and optionally fund it with testnet XRP 🆕')
  .action(createWallet);

program
  .command('mint')
  .description('Mint stablecoins to an address ✨')
  .argument('<amount>', 'Amount to mint')
  .argument('<destination>', 'Destination address')
  .action(mint);

program
  .command('burn')
  .description('Burn (redeem) stablecoins 🔥')
  .argument('<amount>', 'Amount to burn')
  .action(burn);

program
  .command('send')
  .description('Send stablecoins to an address 🚚')
  .argument('<amount>', 'Amount to send')
  .argument('<address>', 'Destination address')
  .action(send);

program
  .command('balance')
  .description('Check stablecoin balance for an address 📈')
  .argument('<address>', 'Address to check')
  .action(balance);

program
  .command('freeze')
  .description('Freeze an address ❄️')
  .argument('<address>', 'Address to freeze')
  .action(freeze);

program.parse();
