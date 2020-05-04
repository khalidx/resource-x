import {expect, test} from '@oclif/test'

describe('undeploy', () => {
  test
  .stdout()
  .command(['undeploy'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['undeploy', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
