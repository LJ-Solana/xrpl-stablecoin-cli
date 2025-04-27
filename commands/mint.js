const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;
const inquirer = require('inquirer').default;
    
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
        type: 'input',
        name: 'destination',
        message: 'Enter destination address:',
        validate: (input) => {
          if (!input.startsWith('r') || input.length !== 34) {
            return 'Please enter a valid XRPL address (starts with r and is 34 characters)';
          }
          return true;
        }
      }
    ]);

    spinner.start('Preparing mint transaction... 🛠️');

    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: answers.destination,
      Amount: {
        currency: answers.symbol.toUpperCase(), // Convert to uppercase for consistency
        issuer: wallet.classicAddress,
        value: answers.amount,
      },
      LastLedgerSequence: null // Let autofill set this
    };

    const prepared = await client.autofill(tx);
    // Add 20 ledgers to the LastLedgerSequence to give more time
    prepared.LastLedgerSequence += 20;
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Stablecoin minted and sent 🎉');
    console.log(chalk.greenBright(JSON.stringify(result.result, null, 2)));
  } catch (error) {
    spinner.fail('Failed to mint ❌');
    console.error(chalk.redBright(error));
  } finally {
    await disconnect();
  }
}

module.exports = mint;
