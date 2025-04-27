const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;

async function send(amount, address) {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    spinner.start('Preparing send transaction 📦');

    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: address,
      Amount: {
        currency: 'USD',
        issuer: wallet.classicAddress,
        value: amount,
      },
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Stablecoin sent 🚀');
    console.log(chalk.greenBright(JSON.stringify(result.result, null, 2)));
  } catch (error) {
    spinner.fail('Failed to send ❌');
    console.error(chalk.redBright(error));
  } finally {
    await disconnect();
  }
}

module.exports = send;
