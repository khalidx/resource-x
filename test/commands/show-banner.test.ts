import {expect, test} from '@oclif/test'

describe('hooks', () => {
  test
  .stdout()
  .hook('init', {id: 'mycommand'})
  .do(output => expect(output.stdout).to.contain('resource-x'))
  .it('shows a message')
})
