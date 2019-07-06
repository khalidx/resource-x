import path from 'path'
import fse from 'fs-extra'

import { log } from './log'
import { rxSubdirectory } from './paths'
import * as rx from '../index'

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
