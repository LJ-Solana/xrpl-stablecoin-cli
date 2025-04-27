const { Wallet } = require('xrpl');
const QRCode = require('qrcode');
const ora = require('ora').default;
const chalk = require('chalk').default;
const fs = require('fs');
const path = require('path');
const { client, connect, disconnect } = require('../utils/xrplClient');

async function getWalletInfo() {
  const spinner = ora('Getting wallet information...').start();
  
  try {
    const walletPath = path.join(process.cwd(), 'wallet.json');
    
    if (!fs.existsSync(walletPath)) {
      spinner.fail('No wallet found');
      console.log(chalk.yellow('\nPlease create a wallet first using:'));
      console.log(chalk.cyan('xrpl-stablecoin create-wallet'));
      return;
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const wallet = Wallet.fromSeed(walletData.seed);
    
    spinner.succeed('Wallet information retrieved successfully!');

    // Display wallet info
    console.log(chalk.green('\nWallet Information:'));
    console.log(chalk.cyan('Address:'), wallet.address);
    console.log(chalk.cyan('Public Key:'), wallet.publicKey);

    // Generate QR code for address
    try {
      const qrCode = await new Promise((resolve, reject) => {
        QRCode.toString(wallet.address, { 
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

    // Get balance
    const balanceSpinner = ora('Getting balance...').start();
    try {
      await connect();
      const response = await client.request({
        command: 'account_info',
        account: wallet.address
      });
      balanceSpinner.succeed('Balance retrieved successfully!');
      console.log(chalk.green('\nBalance Information:'));
      console.log(chalk.cyan('XRP Balance:'), response.result.account_data.Balance / 1000000);
      await disconnect();
    } catch (error) {
      balanceSpinner.fail('Failed to get balance');
      console.error(chalk.red('Error:'), error.message);
    }
  } catch (error) {
    spinner.fail('Failed to get wallet information');
    console.error(chalk.red('Error:'), error.message);
  }
}

module.exports = getWalletInfo; 