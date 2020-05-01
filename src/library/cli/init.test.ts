import test from 'ava'

import path from 'path'
import fse from 'fs-extra'

import { init } from './init'

let scratchDirectory = path.join(__dirname, '../scratch-init/')

test.before(async t => {
  // create a temporary scratch directory for test files
  await fse.ensureDir(scratchDirectory)
})

test('can initialize a new project', async t => {
  await init(scratchDirectory)
  t.true(await fse.pathExists(path.join(scratchDirectory, 'sample.md')))
})

test.after(async t => {
  // delete the temporary scratch directory
  await fse.remove(scratchDirectory)
})
