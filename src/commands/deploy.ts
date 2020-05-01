import {Command, flags} from '@oclif/command'
import {resolve} from 'path'

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
  }
}
