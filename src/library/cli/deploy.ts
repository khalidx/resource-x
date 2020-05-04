import { log } from './log'
import * as files from './files'
import * as rx from '../index'

/**
 * Deploys the API with mock integration to the AWS API Gateway
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const deploy = async (directory: string, file: string): Promise<void> => {
  // Ensure the corresponding swagger file for the provided document file exists 
  let exists = await files.exists(files.swaggerFile(directory, file))
  if (!exists) {
    log('error', 'The swagger.json file does not exist. Run the generate command first.')
    return
  }
  // Read the swagger file
  let specification = await files.readSwaggerFile(directory, file)
  // Add mocks, and save the new specification file
  let specificationWithMocks = await rx.mocks(specification)
  await files.writeSwaggerWithMocksFile(directory, file, specificationWithMocks)
  // Check to see if an existing deployment exists
  let deployExists = await files.exists(files.deployFile(directory, file))
  if (deployExists) {
    // Read the deploy.json
    let { id } = await files.readDeployFile(directory, file)
    // Update the deployment, with the specification with mocks
    log('message', 'Updating the existing deployment ...')
    let deploy = await rx.deploy(specificationWithMocks, id)
    log('success', `Deployed successfully. Url:\n${deploy.url}`)
  } else {
    log('message', 'Creating a new deployment ...')
    // Deploy the specification with mocks
    let deploy = await rx.deploy(specificationWithMocks)
    // Write the deploy.json (so that new deploys will deploy to the same API)
    await files.writeDeployFile(directory, file, deploy)
    log('success', `Deployed successfully. Url:\n${deploy.url}`)
  }
}
