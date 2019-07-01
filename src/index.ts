import marked from 'marked'
import yaml from 'yamljs'
import pluralize from 'pluralize'
import swagger from 'swagger-parser'
import { Spec } from 'swagger-schema-official'
import camelCase from 'camelcase'
import AWS from 'aws-sdk'

/**
 * Uses the marked lexer to extract tokens from the Markdown document
 * @param document the Markdown document, as a string
 */
export const tokens = async (document: string): Promise<marked.TokensList> => {
  try {
    return marked.lexer(document)
  } catch (error) {
    throw new Error(`Error while parsing the Markdown document: ${error.message}`)
  }
}

/**
 * Finds Markdown code blocks in the token list, and combines them into a string containing schemas
 * @param tokens the Markdown tokens
 */
export const schemas = async (tokens: marked.TokensList): Promise<string> => {
  try {
    return tokens.reduce((combined, token) => {
      if (token.type === 'code' && token.text.length > 0) {
        if (token.lang === 'json') {
          return combined += `${yaml.stringify(JSON.parse(token.text))}\n`
        }
        if (token.lang === 'yaml') {
          return combined += `${token.text}\n`
        }
      }
      return combined
    }, '')
  } catch (error) {
    throw new Error(`Error while extracting schemas from the Markdown document: ${error.message}`)
  }
}

/**
 * Creates a Swagger API specification with CRUD operations for each schema
 * @param schemas the combined schemas string
 */
export const specification = async (schemas: string): Promise<Spec> => {
  try {
    // build a swagger definition from schemas
    let specification: Spec = {
      swagger: '2.0',
      info: {
        title: 'schemas',
        version: '1.0.0'
      },
      consumes: [ 'application/json' ],
      produces: [ 'application/json' ],
      paths: {},
      definitions: yaml.parse(schemas)
    }
    // validate schemas
    specification = await swagger.validate(specification)
    // build all default routes for all resources
    for (let key of Object.keys(specification.definitions)) {
      let collection = pluralize(key)
      specification.tags = [
        { name: collection }
      ]
      specification.paths[`/${collection}`] = {
        get: {
          operationId: camelCase([ 'get', collection ]),
          tags: [ collection ],
          responses: {
            '200': {
              description: '',
              schema: {
                type: 'array',
                items: {
                  $ref: `#/definitions/${key}`
                }
              }
            }
          }
        },
        post: {
          tags: [ collection ],
          operationId: camelCase([ 'post', collection ]),
          responses: {
            '201': {
              description: '',
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          }
        }
      }
      specification.paths[`/${collection}/{${key}Id}`] = {
        get: {
          operationId: camelCase([ 'get', key ]),
          tags: [ collection ],
          parameters: [
            {
              name: `${key}Id`,
              in: 'path',
              required: true,
              type: 'integer',
              format: 'int64'
            }
          ],
          responses: {
            '200': {
              description: '',
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          }
        },
        post: {
          tags: [ collection ],
          operationId: camelCase([ 'post', key ]),
          parameters: [
            {
              name: `${key}Id`,
              in: 'path',
              required: true,
              type: 'integer',
              format: 'int64'
            }
          ],
          responses: {
            '201': {
              description: '',
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          }
        }
      }
    }
    // validate swagger definition against the official swagger schema and spec
    specification = await swagger.validate(specification)
    return specification
  } catch (error) {
    throw new Error(`Error while generating the swagger specification from the document: ${error.message}`)
  }  
}

/**
 * Adds the AWS API Gateway mock integrations to the Swagger API specification
 * @param specification the Swagger API specification object
 */
export const mocks = async (specification: Spec): Promise<Spec> => {
  try {
    for (let pathKey of Object.keys(specification.paths)) {
      for (let operationKey of Object.keys(specification.paths[pathKey])) {
        specification.paths[pathKey][operationKey]['x-amazon-apigateway-integration'] = {
          type: 'mock',
          requestTemplates: {
            'application/json': '{\"statusCode\": 200}'
          },
          responses: {
            default: {
              statusCode: '200'
            }
          },
          passthroughBehavior: 'when_no_match'
        }
      }
    }
    specification = await swagger.validate(specification)
    return specification
  } catch (error) {
    throw new Error(`Error while generating the mock integrations for the swagger specification: ${error.message}`)
  }
}

/**
 * Deploys the Swagger API specification to AWS API Gateway
 * @param specification the Swagger API specification object
 */
export const deploy = async (specification: Spec): Promise<void> => {
  try {
    let gateway = new AWS.APIGateway({
      apiVersion: '2015-07-09',
      credentialProvider: new AWS.CredentialProviderChain([
        () => new AWS.EnvironmentCredentials('AWS'),
        () => new AWS.SharedIniFileCredentials()
      ])
    })
    if (!gateway.config.region) console.error('Please specify an AWS_REGION as an environment variable or in the AWS config file.')
    if (!gateway.config.credentials) console.error('Please specify an AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or AWS_PROFILE) as environment variables.')
    if (!gateway.config.region || !gateway.config.credentials) throw new Error('Missing AWS configuration.')
    let importResponse = await gateway.importRestApi({
      body: JSON.stringify(specification, null, 2),
      failOnWarnings: true
    }).promise()
    let deploymentResponse = await gateway.createDeployment({
      restApiId: importResponse.id,
      stageName: 'dev'
    }).promise()
    console.log(`Url: https://${importResponse.id}.execute-api.${process.env.AWS_REGION}.amazonaws.com/dev`)
  } catch (error) {
    throw new Error(`Error while deploying the swagger specification to the AWS API Gateway: ${error.message}`)
  }
}
