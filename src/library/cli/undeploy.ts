import { remove } from 'fs-extra'

import { log } from './log'
import * as files from './files'
import * as rx from '../index'

/**
 * Undeploys (removes) the API from AWS API Gateway
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const undeploy = async (directory: string, file: string): Promise<void> => {
  // Ensure the corresponding deploy.json file for the provided document file exists 
  let exists = await files.exists(files.deployFile(directory, file))
  if (!exists) {
    log('error', 'No deployment found. The deploy.json file does not exist.')
    return
  }
  // Read the deploy.json
  let deploy = await files.readDeployFile(directory, file)
  // Undeploy
  log('message', `Removing deployment ${deploy.id} ...`)
  await rx.undeploy(deploy.id)
  // Remove the deploy.json file for this document
  await remove(files.deployFile(directory, file))
  log('success', 'Undeployed successfully.')
}
