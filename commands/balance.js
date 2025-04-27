const { client, connect, disconnect } = require('../utils/xrplClient');
const ora = require('ora').default;
const chalk = require('chalk').default;

async function balance(address) {
  const spinner = ora('Connecting to XRPL...').start();
  try {
    await connect();
    spinner.succeed('Connected ✅');

    spinner.start('Fetching balances... 🧐');

    const response = await client.request({
      command: 'account_lines',
      account: address,
    });

    spinner.succeed('Balance fetched 📊');
    console.log(chalk.cyanBright(JSON.stringify(response.result.lines, null, 2)));
  } catch (error) {
    spinner.fail('Failed to fetch balance ❌');
    console.error(chalk.redBright(error));
  } finally {
    await disconnect();
  }
}

module.exports = balance;
