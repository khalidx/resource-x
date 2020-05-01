import path from 'path'
import fse from 'fs-extra'
import yaml from 'js-yaml'
import { OpenAPIV2 } from 'openapi-types'

import { Deploy } from '../index'

/**
 * Returns whether the provided path exists
 * @param path the path to a file or directory 
 */
export const exists = (path: string) => fse.pathExists(path)

/**
 * Returns the resolved path to the document file
 * @param file the path of the document file to use
 */
export const documentFile = (file: string): string => path.resolve(file)

/**
 * Returns the name of the document file without the extension
 * @param file the path of the document file to use
 */
export const documentFileName = (file: string): string => path.basename(file, path.extname(file))

/**
 * Returns the resolved path to the `.rx/` directory
 * @param directory the absolute path of the directory to use
 */
export const rxDirectory = (directory: string): string => path.join(directory, '.rx/')

/**
 * Returns the resolved path to the `rx/<file>/` subdirectory
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const rxSubdirectory = (directory: string, file: string): string => path.join(rxDirectory(directory), documentFileName(file))

/**
 * Returns the resolved path to the Swagger file 
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const swaggerFile = (directory: string, file: string): string => path.join(rxSubdirectory(directory, file), 'swagger.yaml')

/**
 * Returns the resolved path to the Swagger with mocks file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const swaggerWithMocksFile = (directory: string, file: string): string => path.join(rxSubdirectory(directory, file), 'swagger.mock.yaml')

/**
 * Returns the resolved path to the deployment tracker file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const deployFile = (directory: string, file: string): string => path.join(rxSubdirectory(directory, file), 'deploy.yaml')

/**
 * Returns the resolved path to the `.gitignore` file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const gitignoreFile = (directory: string, file: string): string => path.join(rxSubdirectory(directory, file), '.gitignore')

/**
 * Reads the document file
 * @param file the path of the document file to use
 */
export const readDocumentFile = async (file: string): Promise<string> => (await fse.readFile(documentFile(file))).toString()

/**
 * Reads the Swagger file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const readSwaggerFile = async (directory: string, file: string): Promise<OpenAPIV2.Document> => yaml.safeLoad((await fse.readFile(swaggerFile(directory, file))).toString())

/**
 * Writes the Swagger file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 * @param specification the Swagger specification object
 */
export const writeSwaggerFile = (directory: string, file: string, specification: OpenAPIV2.Document): Promise<void> => fse.writeFile(swaggerFile(directory, file), yaml.safeDump(specification, { noRefs: true }))

/**
 * Reads the Swagger with mocks file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const readSwaggerWithMocksFile = async (directory: string, file: string): Promise<OpenAPIV2.Document> => yaml.safeLoad((await fse.readFile(swaggerWithMocksFile(directory, file))).toString())

/**
 * Writes the Swagger with mocks file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 * @param specification the Swagger specification object
 */
export const writeSwaggerWithMocksFile = (directory: string, file: string, specification: OpenAPIV2.Document): Promise<void> => fse.writeFile(swaggerWithMocksFile(directory, file), yaml.safeDump(specification, { noRefs: true}))

/**
 * Reads the deployment tracker file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const readDeployFile = async (directory: string, file: string): Promise<Deploy> => yaml.safeLoad((await fse.readFile(deployFile(directory, file))).toString())

/**
 * Writes the deployment tracker file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 * @param deploy the deploy object
 */
export const writeDeployFile = (directory: string, file: string, deploy: Deploy): Promise<void> => fse.writeFile(deployFile(directory, file), yaml.safeDump(deploy, { noRefs: true }))

/**
 * Writes the `.gitignore` file
 * @param directory the absolute path of the directory to use
 * @param file the path of the document file to use
 */
export const writeGitignoreFile = async (directory: string, file: string): Promise<void> => fse.writeFile(gitignoreFile(directory, file), '# Ignoring this directory (generated by resource-x)\n*\n# Except for the deploy.yaml\n!deploy.yaml\n')
