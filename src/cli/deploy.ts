import path from 'path'
import fse from 'fs-extra'

import { log } from './log'
import { rxSubdirectory, swaggerFile } from './paths'
import * as rx from '../index'

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
