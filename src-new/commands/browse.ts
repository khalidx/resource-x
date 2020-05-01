import {Command, flags} from '@oclif/command'
import {resolve} from 'path'

export default class Browse extends Command {
  static description = 'opens the browser to view the resources in the document file'

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
    const {args, flags} = this.parse(Browse)
  }
}
