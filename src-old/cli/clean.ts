import { remove } from 'fs-extra'
import inquirer from 'inquirer'

import { log } from './log'
import { rxDirectory } from './files'

/**
 * Removes the generated .rx/ directory
 * @param directory the absolute path of the directory to use
 */
export const clean = async (directory: string): Promise<void> => {
  log('message', 'Cleaning the .rx/ directory will remove any AWS API ID tracker (deploy.json) files.')
  log('message', 'The next time you deploy, a new API will be created.')
  let { proceed } = await inquirer.prompt<{ proceed: boolean }>([
    {
      name: 'proceed',
      message: 'Are you sure you would like to continue?',
      type: 'confirm',
      default: false
    }
  ])
  if (!proceed) {
    log('message', 'No changes made.')
    return
  }
  await remove(rxDirectory(directory))
  log('success', 'Directory removed.')
}
