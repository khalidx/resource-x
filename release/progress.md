# progress

Prioritized tasks that are currently in progress.

- [ ] I should be able to provide my own code for a route/resource/event

## to do

- [ ] fix: all log statements should go through oclif logs
- [ ] fix: all errors should go through oclif errors
- [ ] fix: change `passthroughBehavior` to `never` instead of `when_no_match`, if correct
- [ ] bug: `rx init` shouldn't overwrite a file if it exists. Can overwrite with `--force`.
- [ ] bug: the CORS headers should be added to all operations, not just `OPTIONS`
- [ ] bug: all errors should be friendly, unless verbose is on.
- [ ] feature: all log output history should be stored like git log or reflog format.
- [ ] feature: upgrade to AWS API Gateway v2 API
- [ ] bug: oclif autocomplete doesn't work when opening a new shell on mac (maybe because of bashrc instead of bash_profile?)

## notes

```typescript
import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda'
import { APIGateway } from 'aws-sdk'

const gateway = new APIGateway()

export const handler: APIGatewayProxyHandler = async function (event, context) {
  const getExportResponse = await gateway.getExport({
    restApiId: event.requestContext.apiId,
    stageName: event.requestContext.stage,
    exportType: 'swagger',
    parameters: event.requestContext.path === '/docs/postman' ? { extensions: 'postman' } : undefined,
    accepts: 'application/json'
  }).promise()
  if (!getExportResponse.body) {
    console.error('No export returned')
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: getExportResponse.body.toString()
  }
}
```

```yaml
  /docs/swagger:
    get:
      summary: Returns a swagger specification
      description: Returns a swagger specification
      produces:
        - application/json
      responses:
        200:
          description: OK
          schema:
            $ref: "#/definitions/SpecResponse"
      security:
        - api_key: []
      x-amazon-apigateway-auth:
        type: aws_iam
      x-amazon-apigateway-integration:
        type: aws_proxy
        httpMethod: POST
        uri: ${spec_lambda_invoke_arn}
        passthroughBehavior: when_no_match
  /docs/postman:
    get:
      summary: Returns a postman collection
      description: Returns a postman collection
      produces:
        - application/json
      responses:
        200:
          description: OK
          schema:
            $ref: "#/definitions/SpecResponse"
      security:
        - api_key: []
      x-amazon-apigateway-auth:
        type: aws_iam
      x-amazon-apigateway-integration:
        type: aws_proxy
        httpMethod: POST
        uri: ${spec_lambda_invoke_arn}
        passthroughBehavior: when_no_match 
```
