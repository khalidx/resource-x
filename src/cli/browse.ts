import fse from 'fs-extra'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import open from 'open'

import { log } from './log'
import { swaggerFile } from './paths'

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
