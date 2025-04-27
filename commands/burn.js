const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;
const inquirer = require('inquirer').default;
const { Wallet } = require('xrpl');

async function burn() {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    // Ask if user wants to use current wallet or provide a different one
    const { walletChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'walletChoice',
        message: 'Which wallet would you like to burn from?',
        choices: [
          { name: 'Current wallet', value: 'current' },
          { name: 'Enter a different wallet', value: 'custom' }
        ]
      }
    ]);

    let burnWallet = wallet;
    if (walletChoice === 'custom') {
      const { address, seed } = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: 'Enter the wallet address:',
          validate: (input) => {
            if (!input.startsWith('r') || input.length !== 34) {
              return 'Please enter a valid XRPL address (starts with r and is 34 characters)';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'seed',
          message: 'Enter the wallet seed:',
          validate: (input) => {
            if (!input.startsWith('s') || input.length < 30) {
              return 'Please enter a valid seed (starts with s)';
            }
            return true;
          }
        }
      ]);
      burnWallet = Wallet.fromSeed(seed);
    }

    // Get account lines to find available stablecoins
    spinner.start('Fetching available stablecoins... 📊');
    const accountLines = await client.request({
      command: 'account_lines',
      account: burnWallet.classicAddress,
      ledger_index: 'validated'
    });

    const stablecoins = accountLines.result.lines
      .filter(line => {
        const balance = parseFloat(line.balance);
        return balance > 0; // Only show stablecoins with positive balance
      })
      .map(line => ({
        name: `${line.currency} (Balance: ${line.balance})`,
        value: line // Store the entire line object
      }));

    spinner.stop(); // Stop the spinner before showing the prompt

    if (stablecoins.length === 0) {
      console.log('\n' + chalk.yellow('No stablecoins found ❌'));
      console.log(chalk.yellow('You need to mint some stablecoins first!'));
      console.log(chalk.cyan('Try: xrpl-stablecoin mint'));
      return;
    }

    // Get user input
    const { symbol } = await inquirer.prompt([
      {
        type: 'list',
        name: 'symbol',
        message: 'Select stablecoin to burn:',
        choices: stablecoins
      }
    ]);

    const { amount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Enter amount to burn:',
        validate: (input) => {
          const num = parseFloat(input);
          if (isNaN(num) || num <= 0) {
            return 'Please enter a valid positive number';
          }
          if (num > parseFloat(symbol.balance)) {
            return `Amount cannot exceed balance of ${symbol.balance}`;
          }
          return true;
        }
      }
    ]);

    console.log('\n' + chalk.cyan('📝 Burn Details:'));
    console.log(chalk.gray('─────────────────────────────'));
    console.log(chalk.white(`Symbol: ${chalk.yellow(symbol.currency)}`));
    console.log(chalk.white(`Amount: ${chalk.yellow(amount)}`));
    console.log(chalk.white(`Issuer: ${chalk.yellow(symbol.account)}`));
    console.log(chalk.gray('─────────────────────────────\n'));

    spinner.start('Preparing burn transaction... 🔥');

    const tx = {
      TransactionType: 'Payment',
      Account: burnWallet.classicAddress,
      Destination: symbol.account, // burn by sending to issuer
      Amount: {
        currency: symbol.currency,
        issuer: symbol.account,
        value: amount,
      }
    };

    const prepared = await client.autofill(tx);
    const signed = burnWallet.sign(prepared);
    
    spinner.text = 'Submitting transaction... 📤';
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Stablecoin burned successfully! 💨');
    console.log('\n' + chalk.green('✅ Transaction Details:'));
    console.log(chalk.gray('─────────────────────────────'));
    const txUrl = `https://testnet.xrpl.org/transactions/${result.result.hash}`;
    console.log(chalk.white(`Transaction Hash: ${chalk.yellow.underline(txUrl)}`));
    console.log(chalk.white(`Ledger Index: ${chalk.yellow(result.result.ledger_index)}`));
    console.log(chalk.gray('─────────────────────────────\n'));
  } catch (error) {
    spinner.fail('Failed to burn ❌');
    console.log('\n' + chalk.red('❌ Error Details:'));
    console.log(chalk.gray('─────────────────────────────'));
    console.log(chalk.white(`Error: ${chalk.red(error.message)}`));
    if (error.data) {
      console.log(chalk.white(`Additional Info: ${chalk.red(JSON.stringify(error.data, null, 2))}`));
    }
    console.log(chalk.gray('─────────────────────────────\n'));
  } finally {
    await disconnect();
  }
}

module.exports = burn;
