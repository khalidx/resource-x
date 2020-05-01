import {Command, flags} from '@oclif/command'
import {resolve} from 'path'
import {undeploy} from '../library/cli/undeploy'

export default class Undeploy extends Command {
  static description = 'undeploy the API from AWS API Gateway'

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
    const {args, flags} = this.parse(Undeploy)
    await undeploy(process.cwd(), args.file)
  }
}
