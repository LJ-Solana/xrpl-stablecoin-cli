const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;
const inquirer = require('inquirer').default;
const { Wallet } = require('xrpl');
    
async function mint() {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    // Get user input
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'symbol',
        message: 'Enter stablecoin symbol (e.g., USD, EUR, GBP):',
        validate: (input) => {
          if (!input || input.length < 3 || input.length > 20) {
            return 'Symbol must be between 3 and 20 characters';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'amount',
        message: 'Enter amount to mint:',
        validate: (input) => {
          const num = parseFloat(input);
          if (isNaN(num) || num <= 0) {
            return 'Please enter a valid positive number';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'generateNewWallet',
        message: 'Would you like to generate a new wallet for the destination?',
        default: true
      }
    ]);

    let destinationWallet;
    if (answers.generateNewWallet) {
      spinner.start('Generating new wallet... 🆕');
      destinationWallet = Wallet.generate();
      
      console.log('\n' + chalk.cyan('🎉 New Wallet Generated:'));
      console.log(chalk.gray('─────────────────────────────'));
      console.log(chalk.white(`Address: ${chalk.yellow(destinationWallet.classicAddress)}`));
      console.log(chalk.white(`Seed: ${chalk.yellow(destinationWallet.seed)}`));
      console.log(chalk.gray('─────────────────────────────\n'));

      // Fund the new wallet with testnet XRP
      spinner.text = 'Funding new wallet with testnet XRP... 💰';
      const fundResult = await client.fundWallet(destinationWallet);
      console.log(chalk.green(`Funded with ${fundResult.balance} XRP`));
    } else {
      const { customAddress, customSeed } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customAddress',
          message: 'Enter destination address:',
          validate: (input) => {
            if (!input.startsWith('r') || input.length !== 34) {
              return 'Please enter a valid XRPL address (starts with r and is 34 characters)';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'customSeed',
          message: 'Enter destination seed:',
          validate: (input) => {
            if (!input.startsWith('s') || input.length < 30) {
              return 'Please enter a valid seed (starts with s)';
            }
            return true;
          }
        }
      ]);
      destinationWallet = Wallet.fromSeed(customSeed);
    }

    console.log('\n' + chalk.cyan('📝 Transaction Details:'));
    console.log(chalk.gray('─────────────────────────────'));
    console.log(chalk.white(`Symbol: ${chalk.yellow(answers.symbol.toUpperCase())}`));
    console.log(chalk.white(`Amount: ${chalk.yellow(answers.amount)}`));
    console.log(chalk.white(`Destination: ${chalk.yellow(destinationWallet.classicAddress)}`));
    console.log(chalk.gray('─────────────────────────────\n'));

    // First, set up trust line if needed
    if (destinationWallet.classicAddress !== wallet.classicAddress) {
      spinner.start('Setting up trust line... 🔄');
      const trustSetTx = {
        TransactionType: 'TrustSet',
        Account: destinationWallet.classicAddress,
        LimitAmount: {
          currency: answers.symbol.toUpperCase(),
          issuer: wallet.classicAddress,
          value: '1000000000' // High limit
        }
      };

      const preparedTrustSet = await client.autofill(trustSetTx);
      const signedTrustSet = destinationWallet.sign(preparedTrustSet);
      const trustResult = await client.submitAndWait(signedTrustSet.tx_blob);
      console.log(chalk.green('Trust line established successfully'));
    }

    // Now prepare the mint transaction
    spinner.start('Preparing mint transaction... 🛠️');
    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: destinationWallet.classicAddress,
      Amount: {
        currency: answers.symbol.toUpperCase(),
        issuer: wallet.classicAddress,
        value: answers.amount,
      }
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    
    spinner.text = 'Submitting transaction... 📤';
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Transaction successful! 🎉');
    console.log('\n' + chalk.green('✅ Transaction Details:'));
    console.log(chalk.gray('─────────────────────────────'));
    const txUrl = `https://testnet.xrpl.org/transactions/${result.result.hash}`;
    console.log(chalk.white(`Transaction Hash: ${chalk.yellow.underline(txUrl)}`));
    console.log(chalk.white(`Ledger Index: ${chalk.yellow(result.result.ledger_index)}`));
    console.log(chalk.gray('─────────────────────────────\n'));
  } catch (error) {
    spinner.fail('Transaction failed ❌');
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

module.exports = mint;
