const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora');
const chalk = require('chalk');
    
async function mint(amount, destination) {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    spinner.start('Preparing mint transaction... 🛠️');

    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: destination,
      Amount: {
        currency: 'USD', // Stablecoin symbol
        issuer: wallet.classicAddress,
        value: amount,
      },
    };

    const prepared = await client.autofill(tx);
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
