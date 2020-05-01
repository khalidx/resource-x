import {Command, flags} from '@oclif/command'
import {CLIError} from '@oclif/errors'
import {resolve} from 'path'
import notifier from 'node-notifier'
import Listr from 'listr'
import {deploy} from '../library/cli/deploy'

export default class Deploy extends Command {
  static description = 'deploy the API with mock integration to AWS API Gateway'

  static flags = {
    help: flags.help({char: 'h'}),
    force: flags.boolean({char: 'f'}),
  }

  static args = [
    {
      name: 'file',
      required: true,
      description: 'the input file',
      parse: (input: string) => resolve(input),
    }
  ]

  async run() {
    const {args, flags} = this.parse(Deploy)

    const tasks = new Listr([
      {
        title: 'Deploying your api',
        task: () => deploy(process.cwd(), args.file)
      },
    ])

    await tasks
    .run()
    .then(() => {
      notifier.notify({
        title: 'resource-x',
        message: 'Deployed!'
      })
    })
    .catch((error) => {
      notifier.notify({
        title: 'resource-x',
        message: 'Failed!'
      })
      throw new CLIError('The last command failed.')
    })

  }
}
