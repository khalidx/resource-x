#!/usr/bin/env node

import fse from 'fs-extra'
import path from 'path'
import program from 'commander'
import figlet from 'figlet'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import open from 'open'

import * as rx from './index'

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
    let specification = await rx.specification(await rx.schemas(await rx.tokens(document)))
    // Ensure the output .rx/ directory is created
    let rxDirectory = await path.join(directory, '.rx/')
    await fse.ensureDir(rxDirectory)
    // Write a .gitignore to the .rx/ directory to ensure generated files are not committed
    await fse.writeFile(path.join(rxDirectory, '.gitignore'), '# Ignoring this directory\n*\n')
    // Ensure the output .rx/<file>/ directory is created
    let specificDirectory = await path.join(rxDirectory, path.basename(file, path.extname(file)))
    await fse.ensureDir(specificDirectory)
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
    // Deploy the specification with mockss
    await rx.deploy(specificationWithMocks)
  } catch (error) {
    throw new Error(`Error while deploying the API to the AWS API Gateway: ${error.message}`)
  }
}

/**
 * Removes the generated .rx/ directory
 * @param directory the path of the directory to use
 */
export const clean = async (directory: string): Promise<void> => fse.remove(path.join(directory, '.rx/'))

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

let { name, version } = require('../package.json')

program
  .version(version)

program
  .command('init')
  .description('initialize a new sample project in the current directory')
  .action((cmd) => showBanner(name).then(() => init(process.cwd()).catch(console.error)))

program
  .command('generate <file>')
  .description('generate an API specification from the document file')
  .action((file, cmd) => showBanner(name).then(() => generate(process.cwd(), file).catch(console.error)))

program
  .command('browse <file>')
  .description('opens the browser to view the resources in the document file')
  .action((file, cmd) => showBanner(name).then(() => browse(process.cwd(), file).catch(console.error)))

program
  .command('deploy <file>')
  .description('deploy the API with mock integration to AWS API Gateway')
  .action((file, cmd) => showBanner(name).then(() => deploy(process.cwd(), file).catch(console.error)))

program
  .command('output <file>')
  .description('output the deployment files without actually deploying')
  .action((file, cmd) => showBanner(name).then(() => console.error('Not yet implemented.')))

program
  .command('undeploy <file>')
  .description('undeploy the API from AWS API Gateway')
  .action((file, cmd) => showBanner(name).then(() => console.error('Not yet implemented.')))

program
  .command('clean')
  .description('remove the generated .rx/ directory')
  .action((cmd) => showBanner(name).then(() => clean(process.cwd()).catch(console.error)))

program
  .parse(process.argv)
