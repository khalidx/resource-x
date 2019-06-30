import test from 'ava'

import path from 'path'
import fse from 'fs-extra'

import {
  init,
  generate,
  clean
} from './cli'

let scratchDirectory = path.join(__dirname, '../scratch/')

test.before(async t => {
  // create a temporary scratch directory for test files
  await fse.ensureDir(scratchDirectory)
})

test.serial('can initialize a new project', async t => {
  await init(scratchDirectory)
  t.true(await fse.pathExists(path.join(scratchDirectory, 'sample.md')))
})

test.serial('can generate an API specification', async t => {
  await generate(scratchDirectory, 'sample.md')
  t.true(await fse.pathExists(path.join(scratchDirectory, '.rx/sample/', 'swagger.json')))
})

test.serial('can remove the generated .rx/ directory', async t => {
  await clean(scratchDirectory)
  t.false(await fse.pathExists(path.join(scratchDirectory, '.rx/')))
})

test.after(async t => {
  // delete the temporary scratch directory
  await fse.remove(scratchDirectory)
})
