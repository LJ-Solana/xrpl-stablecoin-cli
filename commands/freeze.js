const { client, wallet, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;

async function freeze(address) {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    spinner.start('Freezing account ❄️');

    const tx = {
      TransactionType: 'TrustSet',
      Account: wallet.classicAddress,
      LimitAmount: {
        currency: 'USD',
        issuer: wallet.classicAddress,
        value: '0',
      },
      Flags: 131072, // tfSetFreeze
      QualityIn: 0,
      QualityOut: 0,
      Destination: address,
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    spinner.succeed('Account frozen ⛄️');
    console.log(chalk.greenBright(JSON.stringify(result.result, null, 2)));
  } catch (error) {
    spinner.fail('Failed to freeze ❌');
    console.error(chalk.redBright(error));
  } finally {
    await disconnect();
  }
}

module.exports = freeze;
