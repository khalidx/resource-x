import marked from 'marked'
import yaml from 'js-yaml'
import pluralize from 'pluralize'
import swagger from 'swagger-parser'
import { OpenAPIV2 } from 'openapi-types'
import { cloneDeep } from 'lodash'
import camelCase from 'camelcase'
import jsf from 'json-schema-faker'
import AWS from 'aws-sdk'
import proxy from 'proxy-agent'

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
 * Finds Markdown code blocks in the token list, and combines them into a YAML string containing schemas
 * @param tokens the Markdown tokens
 */
export const schemas = async (tokens: marked.TokensList): Promise<string> => {
  try {
    return tokens.reduce((combined, token) => {
      if (token.type === 'code' && token.text.length > 0) {
        if (token.lang === 'json') {
          return combined += `${yaml.safeDump(JSON.parse(token.text), { noRefs: true })}\n`
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
 * Finds the first top-level (h1) Markdown heading in the token list, and normalizes it.
 * Normalization turns the title into all lowercase with dashes instead of spaces.
 * @param tokens the Markdown tokens
 */
export const title = async (tokens: marked.TokensList): Promise<string> => {
  try {
    let heading = tokens.find(token => token.type === 'heading' && token.depth == 1) as marked.Tokens.Heading
    if (!heading || !heading.text || heading.text.length == 0)
      throw new Error('No heading found in the document. Specify a heading like "# Some heading"')
    return heading.text.toLowerCase().split(' ').join('-')
  } catch (error) {
    throw new Error(`Error while getting title from the Markdown document: ${error.message}`)
  }
}

/**
 * Creates a Swagger API specification with CRUD operations for each schema
 * @param schemas the combined schemas string
 */
export const specification = async (schemas: string, title: string): Promise<OpenAPIV2.Document> => {
  try {
    // build a swagger definition from schemas
    let specification: OpenAPIV2.Document = {
      swagger: '2.0',
      info: {
        title,
        version: '1.0.0'
      },
      consumes: [ 'application/json' ],
      produces: [ 'application/json' ],
      tags: [],
      paths: {},
      definitions: yaml.safeLoad(schemas)
    }
    // validate schemas
    await swagger.validate(cloneDeep(specification))
    // build all default routes for all resources
    for (let key of Object.keys(specification.definitions)) {
      let collection = pluralize(key)
      specification.tags.push({ name: collection })
      specification.paths[`/${collection}`] = {
        get: {
          operationId: camelCase([ 'get', collection ]),
          tags: [ collection ],
          responses: {
            '200': {
              description: '200 OK',
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
          operationId: camelCase([ 'post', collection ]),
          tags: [ collection ],
          parameters: [
            {
              name: key,
              in: 'body',
              required: true,
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          ],
          responses: {
            '201': {
              description: '201 Created',
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          }
        },
        options: {
          operationId: camelCase([ 'options', collection ]),
          tags: [ 'cors' ],
          responses: {
            '200': {
              description: '200 OK',
              headers: {
                'Access-Control-Allow-Headers': {
                  type: 'string'
                },
                'Access-Control-Allow-Methods': {
                  type: 'string'
                },
                'Access-Control-Allow-Origin': {
                  type: 'string'
                }
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
              description: '200 OK',
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          }
        },
        put: {
          operationId: camelCase([ 'put', key ]),
          tags: [ collection ],
          parameters: [
            {
              name: `${key}Id`,
              in: 'path',
              required: true,
              type: 'integer',
              format: 'int64'
            },
            {
              name: key,
              in: 'body',
              required: true,
              schema: {
                $ref: `#/definitions/${key}`
              }
            }
          ],
          responses: {
            '204': {
              description: '204 No Content'
            }
          }
        },
        delete: {
          operationId: camelCase([ 'delete', key ]),
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
            '204': {
              description: '204 No Content'
            }
          }
        },
        options: {
          operationId: camelCase([ 'options', key ]),
          tags: [ 'cors' ],
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
              description: '200 OK',
              headers: {
                'Access-Control-Allow-Headers': {
                  type: 'string'
                },
                'Access-Control-Allow-Methods': {
                  type: 'string'
                },
                'Access-Control-Allow-Origin': {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
    // validate swagger definition against the official swagger schema and spec
    await swagger.validate(cloneDeep(specification))
    // bundle and use internal $refs
    specification = await swagger.bundle(specification) as OpenAPIV2.Document
    return specification
  } catch (error) {
    throw new Error(`Error while generating the swagger specification from the document: ${error.message}`)
  }  
}

/**
 * Adds the AWS API Gateway request validation and mock integrations to the Swagger API specification
 * @param specification the Swagger API specification object
 */
export const mocks = async (specification: OpenAPIV2.Document): Promise<OpenAPIV2.Document> => {
  try {
    // validate and dereference the specification
    specification = await swagger.validate(specification) as OpenAPIV2.Document
    specification['x-amazon-apigateway-request-validators'] = {
      validateBodyAndParameters: {
        validateRequestBody: true,
        validateRequestParameters: true
      }
    }
    specification['x-amazon-apigateway-request-validator'] = 'validateBodyAndParameters'
    for (let pathKey of Object.keys(specification.paths)) {
      for (let operationKey of Object.keys(specification.paths[pathKey])) {
        let responses = specification.paths[pathKey][operationKey].responses
        let status = Object.keys(responses)[0]
        let schema = responses[status].schema
        let mockData: any
        if (schema) mockData = await jsf.resolve(schema)
        specification.paths[pathKey][operationKey]['x-amazon-apigateway-integration'] = {
          type: 'mock',
          requestTemplates: {
            'application/json': '{\"statusCode\": 200}'
          },
          responses: {
            default: (operationKey === 'options') ? {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
                'method.response.header.Access-Control-Allow-Methods': "'*'",
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              },
              responseTemplates: {
                'application/json': '{}'
              }
            } : (mockData) ? {
              statusCode: `${status}`,
              responseTemplates: {
                'application/json': JSON.stringify(mockData, null, 2)
              } 
            } : {
              statusCode: `${status}`
            }
          },
          passthroughBehavior: 'when_no_match'
        }
      }
    }
    specification = await swagger.validate(specification) as OpenAPIV2.Document
    return specification
  } catch (error) {
    throw new Error(`Error while generating the mock integrations for the swagger specification: ${error.message}`)
  }
}

/**
 * Generates a Terraform string based on the provided Swagger API specification
 * @param specification the Swagger API specification object
 */
export const terraform = async (spec: OpenAPIV2.Document & { [key: string]: any }): Promise<string> => {
  try {
    // validate and dereference the specification, and generate mock integrations
    const specification = await mocks(cloneDeep(spec))
    // initialize the terraform string
    let terraformString = ''
    terraformString += `variable "title" {`                          + '\n'
    terraformString += '  type = string'                             + '\n'
    terraformString += `  description = "The title of the API"`      + '\n'
    terraformString += `  default = "${specification.info.title}"`   + '\n'
    terraformString += '}'                                           + '\n' + '\n'
    terraformString += `variable "version" {`                        + '\n'
    terraformString += '  type = string'                             + '\n'
    terraformString += `  description = "The version of the API"`    + '\n'
    terraformString += `  default = "${specification.info.version}"` + '\n'
    terraformString += '}'                                           + '\n' + '\n'
    // add terraform interpolation support to specification fields
    specification.info.title = '${var.title}'
    specification.info.version = '${var.version}'
    // generate terraform variables for providing AWS API Gateway integrations for each operation
    for (let pathKey of Object.keys(specification.paths)) {
      for (let operationKey of Object.keys(specification.paths[pathKey])) {
        const operationId = specification.paths[pathKey][operationKey].operationId
        const integration = specification.paths[pathKey][operationKey]['x-amazon-apigateway-integration']
        const description = `Provide the AWS API Gateway integration configuration for the ${operationId} operation`
        terraformString += `variable "${operationId}" {`             + '\n'
        terraformString += '  type = string'                         + '\n'
        terraformString += `  description = "${description}"`        + '\n'
        terraformString += '  default = <<EOF'                       + '\n'
        terraformString += `${JSON.stringify(integration, null, 2)}` + '\n'
        terraformString += 'EOF'                                     + '\n'
        terraformString += '}'                                       + '\n' + '\n'
        specification.paths[pathKey][operationKey]['x-amazon-apigateway-integration'] = '${var.' + operationId + '}'
      }
    }
    terraformString += `output "swagger_specification" {`                                + '\n'
    terraformString += `  description = "The interpolated Swagger Specification string"` + '\n'
    terraformString += `  value = local.swagger_specification`                           + '\n'
    terraformString += '}'                                                               + '\n' + '\n'
    terraformString += 'locals {'                                                        + '\n'
    terraformString += '  swagger_specification = <<EOF'                                 + '\n'
    terraformString += `${JSON.stringify(specification, null, 2)}`                       + '\n'
    terraformString += 'EOF'                                                             + '\n'
    terraformString += '}'                                                               + '\n'
    return terraformString
  } catch (error) {
    throw new Error(`Error while generating the terraform for the swagger specification: ${error.message}`)
  }
}

export interface Deploy {
  id: string
  url: string
}

/**
 * Deploys the Swagger API specification to AWS API Gateway
 * @param specification the Swagger API specification object
 * @param id the id of the existing API to update instead of deploying new
 */
export const deploy = async (specification: OpenAPIV2.Document, id?: string): Promise<Deploy> => {
  try {
    let gateway = await createAwsApiGatewayClient()
    let errorMessage = ''
    if (!gateway.config.region) errorMessage += 'Please specify an AWS_REGION as an environment variable or in the AWS config file.\n'
    if (!gateway.config.credentials) errorMessage += 'Please specify an AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or AWS_PROFILE) as environment variables.\n'
    if (!gateway.config.region || !gateway.config.credentials) throw new Error(`Missing AWS configuration.\n${errorMessage}`)
    if (id && id.length > 0) {
      await gateway.putRestApi({
        restApiId: id,
        failOnWarnings: true,
        mode: 'overwrite',
        body: JSON.stringify(specification, null, 2)
      }).promise()
    } else {
      let importResponse = await gateway.importRestApi({
        body: JSON.stringify(specification, null, 2),
        failOnWarnings: true
      }).promise()
      id = importResponse.id
    }
    let deploymentResponse = await gateway.createDeployment({
      restApiId: id,
      stageName: 'dev'
    }).promise()
    return {
      id,
      url: `https://${id}.execute-api.${gateway.config.region}.amazonaws.com/dev`
    }
  } catch (error) {
    throw new Error(`Error while deploying the swagger specification to the AWS API Gateway: ${error.message}`)
  }
}

/**
 * Undeploys the API from the AWS API Gateway
 * @param id the id of the existing API to remove
 */
export const undeploy = async (id: string): Promise<void> => {
  try {
    let gateway = await createAwsApiGatewayClient()
    let errorMessage = ''
    if (!gateway.config.region) errorMessage += 'Please specify an AWS_REGION as an environment variable or in the AWS config file.\n'
    if (!gateway.config.credentials) errorMessage += 'Please specify an AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or AWS_PROFILE) as environment variables.\n'
    if (!gateway.config.region || !gateway.config.credentials) throw new Error(`Missing AWS configuration.\n${errorMessage}`)
    await gateway.deleteRestApi({ restApiId: id }).promise()
  } catch (error) {
    throw new Error(`Error while undeploying the API from AWS API Gateway: ${error.message}`)
  }
}

/**
 * Creates an AWS API Gateway client, used when deploying/undeploying the API
 */
export const createAwsApiGatewayClient = async (): Promise<AWS.APIGateway> => {
  const options: AWS.APIGateway.ClientConfiguration = {
    apiVersion: '2015-07-09',
    credentialProvider: new AWS.CredentialProviderChain([
      () => new AWS.EnvironmentCredentials('AWS'),
      () => new AWS.SharedIniFileCredentials()
    ])
  }
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (proxyUrl) {
    options.httpOptions = {
      // @ts-ignore
      agent: proxy(proxyUrl)
    }
  }
  return new AWS.APIGateway(options)
}
