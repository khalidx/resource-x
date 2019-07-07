
import { ensureDir} from 'fs-extra'
import inquirer from 'inquirer'

import { log } from './log'
import * as files from './files'
import * as rx from '../index'

/**
 * Generates an API specification in the specified directory from the specified document file.
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const generate = async (directory: string, file: string): Promise<void> => {
  // Check if the corresponding swagger file for the provided document file exists 
  let exists = await files.exists(files.swaggerFile(directory, file))
  if (exists) {
    log('message', 'The swagger.json file already exists. The generate command will overwrite this file.')
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
  }
  // Read the document
  let document = await files.readDocumentFile(file)
  // Generate the API specification from the document
  let tokens = await rx.tokens(document)
  let specification = await rx.specification(await rx.schemas(tokens), await rx.title(tokens))
  // Ensure the output .rx/<file>/ directory is created
  await ensureDir(files.rxSubdirectory(directory, file))
  // Write a .gitignore to ensure generated files are not committed
  await files.writeGitignoreFile(directory, file)
  // Write the API specification object to the file-specific directory
  await files.writeSwaggerFile(directory, file, specification)
  log('success', 'Generated the swagger.json file successfully.')
  log('info', `path: ${files.swaggerFile(directory, file)}`)
}
