import path from 'path'
import fse from 'fs-extra'

import { log } from './log'

/**
 * Initializes a new sample project in the specified directory.
 * @param directory the absolute path of the directory to use
 */
export const init = async (directory: string): Promise<void> => {
  // Get the sample document (this is read from the assets directory in the final bundle)
  let document = await fse.readFile(path.join(__dirname, '../../sample.md'))
  // Write the document to the specified directory
  await fse.writeFile(path.join(directory, 'sample.md'), document)
  log('success', 'Created the ./sample.md file successfully.')
}
