import test from 'ava'

import path from 'path'
import fse from 'fs-extra'

import {
  tokens,
  schemas,
  title,
  specification,
  mocks
} from './index'

let document: string

test.before(async t => {
  let file = path.join(__dirname, '../../sample.md')
  document = (await fse.readFile(file)).toString()
})

test('can extract tokens from the Markdown document', async t => {
  let actual = await tokens(document)
  t.true(actual.length > 0)
})

test('can find Markdown code blocks and create a combined schemas string', async t => {
  let actual = await schemas(await tokens(document))
  t.true(actual.length > 0)
})

test('can create a Swagger API specification with CRUD operations for each schema', async t => {
  let tokenss = await tokens(document)
  let actual = await specification(await schemas(tokenss), await title(tokenss))
  t.true(Object.keys(actual.paths).length > 0)
})

test('can add the AWS API Gateway mock integrations to the Swagger API specification', async t => {
  let tokenss = await tokens(document)
  let actual = await mocks(await specification(await schemas(tokenss), await title(tokenss)))
  t.truthy(actual.paths[Object.keys(actual.paths)[0]].post['x-amazon-apigateway-integration'])
  t.is(actual.paths[Object.keys(actual.paths)[0]].post['x-amazon-apigateway-integration'].type, 'mock')
})
