const { Client, Wallet } = require('xrpl');
const QRCode = require('qrcode');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');

async function createWallet() {
  const spinner = ora('Creating wallet...').start();
  
  try {
    // Connect to XRPL
    const client = new Client(process.env.XRPL_NODE || 'wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Generate wallet
    const wallet = Wallet.generate();
    spinner.succeed('Wallet created successfully!');

    // Display wallet info
    console.log(chalk.green('\nWallet Information:'));
    console.log(chalk.cyan('Address:'), wallet.address);
    console.log(chalk.cyan('Seed:'), wallet.seed);
    console.log(chalk.cyan('Public Key:'), wallet.publicKey);

    // Generate QR code for address
    const qrCode = await QRCode.toString(wallet.address, { type: 'terminal' });
    console.log(chalk.yellow('\nQR Code for Address:'));
    console.log(qrCode);

    // Ask if user wants to fund the wallet
    const { shouldFund } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldFund',
        message: 'Would you like to fund this wallet with testnet XRP?',
        default: true
      }
    ]);

    if (shouldFund) {
      const fundSpinner = ora('Funding wallet...').start();
      try {
        // Fund the wallet using the testnet faucet
        const fundResult = await client.fundWallet(wallet);
        fundSpinner.succeed('Wallet funded successfully!');
        console.log(chalk.green('\nFunding Information:'));
        console.log(chalk.cyan('Balance:'), fundResult.balance);
        console.log(chalk.cyan('Sequence:'), fundResult.sequence);
      } catch (error) {
        fundSpinner.fail('Failed to fund wallet');
        console.error(chalk.red('Error:'), error.message);
      }
    }

    await client.disconnect();
  } catch (error) {
    spinner.fail('Failed to create wallet');
    console.error(chalk.red('Error:'), error.message);
  }
}

module.exports = createWallet; 