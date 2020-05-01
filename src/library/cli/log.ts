import debug from 'debug'
import chalk from 'chalk'

const debugCli = debug('rx:cli')
debugCli.log = console.info.bind(console)

/**
 * Logs to the console with colorized output
 * @param message the data to log 
 */
export const log = (type: 'info' | 'message' | 'success' | 'error', message: any) => {
  if (type === 'message') console.log(chalk.yellow(message))
  else if (type === 'success') console.log(chalk.green(message))
  else if (type === 'error') console.log(chalk.red(message))
  else debugCli(chalk.italic.yellow(message))
}
