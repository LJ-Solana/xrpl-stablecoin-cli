const { Wallet } = require('xrpl');
const QRCode = require('qrcode');
const inquirer = require('inquirer').default;
const ora = require('ora').default;
const chalk = require('chalk').default;
const fs = require('fs');
const path = require('path');
const { client, connect, disconnect } = require('../utils/xrplClient');

async function createWallet() {
  const spinner = ora('Creating wallet...').start();
  
  try {
    // Generate wallet first
    const wallet = Wallet.generate();
    
    // Save wallet info to file
    const walletInfo = {
      address: wallet.address,
      seed: wallet.seed,
      publicKey: wallet.publicKey
    };

    const walletPath = path.join(process.cwd(), 'wallet.json');
    fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2));
    
    spinner.succeed('Wallet created successfully!');

    // Display wallet info
    console.log(chalk.green('\nWallet Information:'));
    console.log(chalk.cyan('Address:'), walletInfo.address);
    console.log(chalk.cyan('Seed:'), walletInfo.seed);
    console.log(chalk.cyan('Public Key:'), walletInfo.publicKey);

    // Generate QR code for address
    try {
      const qrCode = await new Promise((resolve, reject) => {
        QRCode.toString(walletInfo.address, { 
          type: 'terminal',
          width: 1,
          margin: 0,
          errorCorrectionLevel: 'L'
        }, (err, string) => {
          if (err) reject(err);
          else resolve(string);
        });
      });
      console.log(chalk.yellow('\nQR Code for Address:'));
      console.log(qrCode);
    } catch (qrError) {
      console.log(chalk.yellow('\nCould not generate QR code:'), qrError.message);
    }

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
        // Connect to XRPL and fund
        await connect();
        const fundResult = await client.fundWallet(wallet);
        fundSpinner.succeed('Wallet funded successfully!');
        console.log(chalk.green('\nFunding Information:'));
        console.log(chalk.cyan('Balance:'), fundResult.balance);
        console.log(chalk.cyan('Sequence:'), fundResult.sequence);
        await disconnect();
      } catch (error) {
        fundSpinner.fail('Failed to fund wallet');
        console.error(chalk.red('Error:'), error.message);
      }
    }
  } catch (error) {
    spinner.fail('Failed to create wallet');
    console.error(chalk.red('Error:'), error.message);
  }
}

module.exports = createWallet; 