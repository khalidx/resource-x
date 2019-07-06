import test from 'ava'

import path from 'path'
import fse from 'fs-extra'

import { init } from './init'
import { generate } from './generate'

let scratchDirectory = path.join(__dirname, '../scratch/generate/')

test.before(async t => {
  // create a temporary scratch directory for test files
  await fse.ensureDir(scratchDirectory)
  // initialize
  await init(scratchDirectory)
})

test('can generate an API specification', async t => {
  await generate(scratchDirectory, 'sample.md')
  t.true(await fse.pathExists(path.join(scratchDirectory, '.rx/sample/', 'swagger.json')))
})

test.after(async t => {
  // delete the temporary scratch directory
  await fse.remove(scratchDirectory)
})
