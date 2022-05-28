
import { basename } from 'path'
import { ensureDir } from 'fs-extra'
import inquirer from 'inquirer'
// @ts-ignore
import postman from 'swagger2-to-postmanv2'

import { log } from './log'
import * as files from './files'
import * as rx from '../index'

/**
 * Generates files in the specified directory from the specified document file.
 * Currently, it generates:
 *   - a Swagger API specification file
 *   - a Postman Collection file
 *   - a Terraform file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const generate = async (directory: string, file: string): Promise<void> => {
  // Check if the corresponding swagger file for the provided document file exists 
  await proceed(await files.exists(files.swaggerFile(directory, file)), basename(files.swaggerFile(directory, file)))
  // Read the document
  let document = await files.readDocumentFile(file)
  // Generate the API specification from the document
  let tokens = await rx.tokens(document)
  let specification = await rx.specification(await rx.schemas(tokens), await rx.title(tokens))
  // Ensure the output .rx/<file>/ directory is created
  await /* TODO: JSFIX could not patch the breaking change:
  Creating a directory with fs-extra no longer returns the path 
  Suggested fix: The returned promise no longer includes the path of the new directory */
  ensureDir(files.rxSubdirectory(directory, file))
  // Write a .gitignore to ensure generated files are not committed
  await files.writeGitignoreFile(directory, file)
  // Write the API specification object to the file-specific directory
  await files.writeSwaggerFile(directory, file, specification)
  log('success', `Generated the ${basename(files.swaggerFile(directory, file))} file successfully.`)
  log('info', `path: ${files.swaggerFile(directory, file)}`)
  // Check if the corresponding postman file for the provided document file exists 
  await proceed(await files.exists(files.postmanFile(directory, file)), basename(files.postmanFile(directory, file)))
  // Write the Postman collection object to the file-specific directory
  const collection = await new Promise<object>((resolve, reject) => postman.convert(
    { type: 'json', data: specification },
    {},
    (error: Error, data: { result: boolean, reason?: string, output?: Array<{ type: 'collection', data: object }> }) => {
    if (error) reject(error)
    else if (!data.result || !data.output || data.output.length !== 1 || !data.output[0].data) reject(new Error(data.reason || 'Failed to generate the postman collection'))
    else resolve(data.output[0].data)
  }))
  await files.writePostmanFile(directory, file, collection)
  log('success', `Generated the ${basename(files.postmanFile(directory, file))} file successfully.`)
  log('info', `path: ${files.postmanFile(directory, file)}`)
  // Check if the corresponding terraform file for the provided document file exists 
  await proceed(await files.exists(files.terraformFile(directory, file)), basename(files.terraformFile(directory, file)))
  let terraform = await rx.terraform(specification)
  // Write the Terraform string to the file-specific directory
  await files.writeTerraformFile(directory, file, terraform)
  log('success', `Generated the ${basename(files.terraformFile(directory, file))} file successfully.`)
  log('info', `path: ${files.terraformFile(directory, file)}`)
}

const proceed = async (exists: boolean, name: string): Promise<void> => {
  if (exists) {
    log('message', `The ${name} file already exists. The generate command will overwrite this file.`)
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
      throw new Error('Confirmation failed.')
    }
  }
}
