import * as marked from 'marked'
import * as yaml from 'yamljs'
import * as pluralize from 'pluralize'
import * as swagger from 'swagger-parser'
import { Spec } from 'swagger-schema-official'
import camelCase from 'camelcase'
import { APIGateway } from 'aws-sdk'

export async function documentToSwagger (document: string): Promise<Spec> {
  try {
    let tokens = marked.lexer(document)
    let schemas = tokens.reduce((combined, token) => {
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
    throw new Error(`Error while generating swagger specification from the document: ${error.message}`)
  }  
}

export async function swaggerToSwaggerMock (specification: Spec): Promise<Spec> {
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
    throw new Error(`Error while generating swagger specification from the document: ${error.message}`)
  }
}

export async function swaggerToApiGateway (specification: Spec): Promise<void> {
  try {
    if (!process.env.AWS_PROFILE || !process.env.AWS_REGION) {
      throw new Error('You must provide an AWS_PROFILE and AWS_REGION to proceed.')
    }
    let gateway = new APIGateway({ apiVersion: '2015-07-09' })
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
    throw new Error(`Error while deploying swagger specification to AWS API Gateway: ${error.message}`)
  }
}
