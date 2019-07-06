#!/usr/bin/env node

import fse from 'fs-extra'
import path from 'path'
import program from 'commander'
import chalk from 'chalk'
import debug from 'debug'
import inquirer from 'inquirer'
import figlet from 'figlet'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import open from 'open'

import * as rx from './index'

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

/**
 * Returns the resolved path to the document file
 * @param file the path of the document file to use
 */
export const documentFile = (file: string) => path.resolve(file)

/**
 * Returns the name of the document file without the extension
 * @param file the path of the document file to use
 */
export const documentFileName = (file: string) => path.basename(file, path.extname(file))

/**
 * Returns the resolved path to the `.rx/` directory
 * @param directory the absolute path of the directory to use
 */
export const rxDirectory = (directory: string) => path.join(directory, '.rx/')

/**
 * Returns the resolved path to the `rx/<file>/` subdirectory
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const rxSubdirectory = (directory: string, file: string) => path.join(rxDirectory(directory), documentFileName(file))

/**
 * Returns the resolved path to the Swagger file 
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const swaggerFile = (directory: string, file: string) => path.join(rxSubdirectory(directory, file), 'swagger.json')

/**
 * Initializes a new sample project in the specified directory.
 * @param directory the absolute path of the directory to use
 */
export const init = async (directory: string): Promise<void> => {
    // Get the sample document (this is read from the assets directory in the final bundle)
    let document = await fse.readFile(path.join(__dirname, '../sample.md'))
    // Write the document to the specified directory
    await fse.writeFile(path.join(directory, 'sample.md'), document)
  log('success', 'Created the ./sample.md file successfully.')
  }

/**
 * Generates an API specification in the specified directory from the specified document file.
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const generate = async (directory: string, file: string): Promise<void> => {
    // Check if the corresponding swagger file for the provided document file exists 
  let exists = await fse.pathExists(swaggerFile(directory, file))
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
  let document = (await fse.readFile(documentFile(file))).toString()
    // Generate the API specification from the document
    let tokens = await rx.tokens(document)
    let specification = await rx.specification(await rx.schemas(tokens), await rx.title(tokens))
    // Ensure the output .rx/<file>/ directory is created
  await fse.ensureDir(rxSubdirectory(directory, file))
    // Write a .gitignore to ensure generated files are not committed
    let gitignore = '# Ignoring this directory (generated by resource-x)\n*\n# Except for the deploy.json\n!deploy.json\n'
  await fse.writeFile(path.join(rxSubdirectory(directory, file), '.gitignore'), gitignore)
    // Write the API specification object to the file-specific directory
  await fse.writeFile(swaggerFile(directory, file), JSON.stringify(specification, null, 2))
  log('success', 'Generated the swagger.json file successfully.')
  log('info', `path: ${swaggerFile(directory, file)}`)
  }

/**
 * Opens the browser to view the generated Swagger API specification.
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const browse = async (directory: string, file: string): Promise<void> => {
    // Ensure the corresponding swagger file for the provided document file exists 
  let exists = await fse.pathExists(swaggerFile(directory, file))
  if (!exists) {
    log('error', 'The .rx/swagger.json file does not exist. Run the generate command first.')
      return
    }
    // Read the swagger file
  let specification = JSON.parse((await fse.readFile(swaggerFile(directory, file))).toString())
    // Serve the Swagger file in the Swagger UI, and open the browser
    let app = express()
    let port = 8080
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification))
    app.listen(port, () => {
    log('message', `swagger-ui listening on port ${port}`)
      open(`http://localhost:${port}/api-docs`)
    })
  }

/**
 * Deploys the API with mock integration to the AWS API Gateway
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const deploy = async (directory: string, file: string): Promise<void> => {
    // Ensure the corresponding swagger file for the provided document file exists 
  let exists = await fse.pathExists(swaggerFile(directory, file))
  if (!exists) {
    log('error', 'The swagger.json file does not exist. Run the generate command first.')
      return
    }
    // Read the swagger file
  let specification = JSON.parse((await fse.readFile(swaggerFile(directory, file))).toString())
    // Add mocks, and save the new specification file
    let specificationWithMocks = await rx.mocks(specification)
  await fse.writeFile(path.join(rxSubdirectory(directory, file), 'swagger.mock.json'), specificationWithMocks)
    // Check to see if an existing deployment exists
  let deployExists = await fse.pathExists(path.join(rxSubdirectory(directory, file), 'deploy.json'))
    if (deployExists) {
      // Read the deploy.json
    let deployFile = await fse.readFile(path.join(rxSubdirectory(directory, file), 'deploy.json'))
      let { id } = JSON.parse(deployFile.toString())
      // Update the deployment, with the specification with mocks
    log('message', 'Updating the existing deployment ...')
    let deploy = await rx.deploy(specificationWithMocks, id)
    log('success', `Deployed successfully. Url:\n${deploy.url}`)
    } else {
    log('message', 'Creating a new deployment ...')
      // Deploy the specification with mocks
      let deploy = await rx.deploy(specificationWithMocks)
      // Write the deploy.json (so that new deploys will deploy to the same API)
    await fse.writeFile(path.join(rxSubdirectory(directory, file), 'deploy.json'), JSON.stringify(deploy, null, 2))
    log('success', `Deployed successfully. Url:\n${deploy.url}`)
  }
}

/**
 * Undeploys (removes) the API from AWS API Gateway
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const undeploy = async (directory: string, file: string): Promise<void> => {
    // Ensure the corresponding deploy.json file for the provided document file exists 
  let deployFile = path.join(rxSubdirectory(directory, file), 'deploy.json')
    let deployFileExists = await fse.pathExists(deployFile)
    if (!deployFileExists) {
    log('error', 'No deployment found. The deploy.json file does not exist.')
      return
    }
    // Read the deploy.json
    let deploy = await fse.readFile(deployFile)
    let { id } = JSON.parse(deploy.toString())
    // Undeploy
  log('message', `Removing deployment ${id} ...`)
    await rx.undeploy(id)
    // Remove the deploy.json file for this document
    await fse.remove(deployFile)
  log('success', 'Undeployed successfully.')
}

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
  await fse.remove(rxDirectory(directory))
  log('success', 'Directory removed.')
}

/**
 * Clears the console and shows the banner
 */
async function showBanner (): Promise<void> {
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

/**
 * Logs and exits with a non-zero status code on error.
 * @param error the error object
 */
async function onError (error: any): Promise<void> {
  // If debug is on, log the entire error object, otherwise log just the message
  log('error', debug.enabled('rx:cli') ? error : error.message)
  process.exit(1)
}

program
  .version(require('../package.json').version)

program
  .option('-d, --debug', 'Show debug-level "verbose" output while running commands')
  .on('option:debug', () => debug.enable('rx:cli'))

program
  .command('init')
  .description('initialize a new sample project in the current directory')
  .action((cmd) => showBanner().then(() => init(process.cwd()).catch(onError)))

program
  .command('generate <file>')
  .description('generate an API specification from the document file')
  .action((file, cmd) => showBanner().then(() => generate(process.cwd(), file).catch(onError)))

program
  .command('browse <file>')
  .description('opens the browser to view the resources in the document file')
  .action((file, cmd) => showBanner().then(() => browse(process.cwd(), file).catch(onError)))

program
  .command('deploy <file>')
  .description('deploy the API with mock integration to AWS API Gateway')
  .action((file, cmd) => showBanner().then(() => deploy(process.cwd(), file).catch(onError)))

program
  .command('undeploy <file>')
  .description('undeploy the API from AWS API Gateway')
  .action((file, cmd) => showBanner().then(() => undeploy(process.cwd(), file).catch(onError)))

program
  .command('clean')
  .description('remove the generated .rx/ directory')
  .action((cmd) => showBanner().then(() => clean(process.cwd()).catch(onError)))

program
  .parse(process.argv)
 