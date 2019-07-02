#!/usr/bin/env node

import fse from 'fs-extra'
import path from 'path'
import program from 'commander'
import inquirer from 'inquirer'
import figlet from 'figlet'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import open from 'open'

import * as rx from './index'

const debug = require('debug')('rx:cli')

/**
 * Initializes a new sample project in the specified directory.
 * @param directory the path of the directory to use
 */
export const init = async (directory: string): Promise<void> => {
  try {
    // Get the sample document (this is read from the assets directory in the final bundle)
    let document = await fse.readFile(path.join(__dirname, '../sample.md'))
    // Write the document to the specified directory
    await fse.writeFile(path.join(directory, 'sample.md'), document)
  } catch (error) {
    throw new Error(`Error while initializing the project: ${error.message}`)
  }
}

/**
 * Generates an API specification in the specified directory from the specified document file.
 * @param directory the path of the directory to use
 * @param file the name of the document file to use
 */
export const generate = async (directory: string, file: string): Promise<void> => {
  try {
    // Read the document from the provided directory and file combination
    let document = (await fse.readFile(path.join(directory, file))).toString()
    // Generate the API specification from the document
    let tokens = await rx.tokens(document)
    let specification = await rx.specification(await rx.schemas(tokens), await rx.title(tokens))
    // Ensure the output .rx/<file>/ directory is created
    let specificDirectory = await path.join(directory, '.rx/', path.basename(file, path.extname(file)))
    await fse.ensureDir(specificDirectory)
    // Write a .gitignore to ensure generated files are not committed
    let gitignore = '# Ignoring this directory (generated by resource-x)\n*\n# Except for the deploy.json\n!deploy.json\n'
    await fse.writeFile(path.join(specificDirectory, '.gitignore'), gitignore)
    // Write the API specification object to the file-specific directory
    await fse.writeFile(path.join(specificDirectory, 'swagger.json'), JSON.stringify(specification, null, 2))
  } catch (error) {
    throw new Error(`Error while generating the API specification: ${error.message}`)
  }
}

/**
 * Opens the browser to view the generated Swagger API specification.
 * @param directory the path of the directory to use
 * @param file the name of the document file to use
 */
export const browse = async (directory: string, file: string): Promise<void> => {
  try {
    // Ensure the corresponding swagger file for the provided document file exists 
    let swaggerFile = path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'swagger.json')
    let swaggerFileExists = await fse.pathExists(swaggerFile)
    if (!swaggerFileExists) {
      console.error('The .rx/swagger.json file does not exist. Run the generate command first.')
      return
    }
    // Read the swagger file
    let specification = JSON.parse((await fse.readFile(swaggerFile)).toString())
    // Serve the Swagger file in the Swagger UI, and open the browser
    let app = express()
    let port = 8080
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification))
    app.listen(port, () => {
      console.log(`swagger-ui listening on port ${port}`)
      open(`http://localhost:${port}/api-docs`)
    })
  } catch (error) {
    throw new Error(`Error while browsing the API specification: ${error.message}`)
  }
}

/**
 * Deploys the API with mock integration to the AWS API Gateway
 * @param directory the path of the directory to use
 * @param file the name of the document file to use
 */
export const deploy = async (directory: string, file: string): Promise<void> => {
  try {
    // Ensure the corresponding swagger file for the provided document file exists 
    let swaggerFile = path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'swagger.json')
    let swaggerFileExists = await fse.pathExists(swaggerFile)
    if (!swaggerFileExists) {
      console.error('The .rx/swagger.json file does not exist. Run the generate command first.')
      return
    }
    // Read the swagger file
    let specification = JSON.parse((await fse.readFile(swaggerFile)).toString())
    // Add mocks, and save the new specification file
    let specificationWithMocks = await rx.mocks(specification)
    await fse.writeFile(path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'swagger.mock.json'), specificationWithMocks)
    // Check to see if an existing deployment exists
    let deployExists = await fse.pathExists(path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'deploy.json'))
    if (deployExists) {
      // Read the deploy.json
      let deployFile = await fse.readFile(path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'deploy.json'))
      let { id } = JSON.parse(deployFile.toString())
      // Update the deployment, with the specification with mocks
      await rx.deploy(specificationWithMocks, id)
    } else {
      // Deploy the specification with mocks
      let deploy = await rx.deploy(specificationWithMocks)
      // Write the deploy.json (so that new deploys will deploy to the same API)
      await fse.writeFile(path.join(directory, '.rx/', path.basename(file, path.extname(file)), 'deploy.json'), JSON.stringify(deploy, null, 2))
    }
  } catch (error) {
    throw new Error(`Error while deploying the API to the AWS API Gateway: ${error.message}`)
  }
}

/**
 * Removes the generated .rx/ directory
 * @param directory the path of the directory to use
 */
export const clean = async (directory: string): Promise<void> => {
  try {
    console.warn('Cleaning the .rx/ directory will remove any AWS API ID tracker (deploy.json) files.')
    console.warn('The next time you deploy, a new API will be created.')
    let { proceed } = await inquirer.prompt<{ proceed: boolean }>([
      {
        name: 'proceed',
        message: 'Are you sure you would like to continue?',
        type: 'confirm',
        default: false
      }
    ])
    if (proceed) {
      await fse.remove(path.join(directory, '.rx/'))
      console.log('Directory removed.')
    } else {
      console.log('No changes made.')
    }
  } catch (error) {
    throw new Error(`Error while removing the generated .rx/ directory: ${error.message}`)
  }
}

/**
 * Clears the console and shows the banner
 */
async function showBanner (text: string): Promise<void> {
  return new Promise(function (resolve, reject) {
    process.stdout.write('\x1b[2J')
    process.stdout.write('\x1b[0f')
    figlet.text(name, function (error, result) {
      if (error) reject(error)
      else {
        console.log(result)
        resolve()
      }
    })
  })
}

/**
 * Logs and exits with a non-zero status code on error.
 * If in deb
 */
async function onError (error: any): Promise<void> {
  process.env.DEBUG ? debug(error) : console.error(error.message)
  process.exit(1)
}

program
  .version(require('../package.json').version)

program
  .command('init')
  .description('initialize a new sample project in the current directory')
  .action((cmd) => showBanner('resource-x').then(() => init(process.cwd()).catch(onError)))

program
  .command('generate <file>')
  .description('generate an API specification from the document file')
  .action((file, cmd) => showBanner(name).then(() => generate(process.cwd(), file).catch(onError)))

program
  .command('browse <file>')
  .description('opens the browser to view the resources in the document file')
  .action((file, cmd) => showBanner(name).then(() => browse(process.cwd(), file).catch(onError)))

program
  .command('deploy <file>')
  .description('deploy the API with mock integration to AWS API Gateway')
  .action((file, cmd) => showBanner(name).then(() => deploy(process.cwd(), file).catch(onError)))

program
  .command('undeploy <file>')
  .description('undeploy the API from AWS API Gateway')
  .action((file, cmd) => showBanner(name).then(() => console.error('Not yet implemented.')))

program
  .command('clean')
  .description('remove the generated .rx/ directory')
  .action((cmd) => showBanner(name).then(() => clean(process.cwd()).catch(onError)))

program
  .parse(process.argv)
 