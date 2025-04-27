const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;

async function burn(amount) {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    spinner.start('Preparing burn transaction 🔥');

    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: wallet.classicAddress, // burn by sending to issuer
      Amount: {
        currency: 'USD',
        issuer: wallet.classicAddress,
        value: amount,
      },
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Stablecoin burned 💨');
    console.log(chalk.greenBright(JSON.stringify(result.result, null, 2)));
  } catch (error) {
    spinner.fail('Failed to burn ❌');
    console.error(chalk.redBright(error));
  } finally {
    await disconnect();
  }
}

module.exports = burn;
