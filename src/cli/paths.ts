import path from 'path'

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
