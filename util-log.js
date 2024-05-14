const chalk = require('chalk');
chalk.level = 2

module.exports = {
  log(content) {
    console.log(content)
  },
  warn(content) {
    console.log(chalk.yellow(content))
  },
  error(content) {
    console.log(chalk.red(content))
  },
  pass(content) {
    console.log(chalk.green(content))
  },
  scaffold(content) {
    console.log(chalk.greenBright('[llscw 脚手架] ') + content)
  },
  queryWait(content) {
    console.log(chalk.yellowBright('[重新查询] ') + content)
  }
}