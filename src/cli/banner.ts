import figlet from 'figlet'

import { log } from './log'

/**
 * Clears the console and shows the banner
 */
export async function showBanner (): Promise<void> {
  return new Promise(function (resolve, reject) {
    process.stdout.write('\x1b[2J')
    process.stdout.write('\x1b[0f')
    figlet.text('resource-x', function (error, result) {
      if (error) reject(error)
      else {
        log('message', result)
        resolve()
      }
    })
  })
}
