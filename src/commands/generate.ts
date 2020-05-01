import {Command, flags} from '@oclif/command'
import {resolve} from 'path'
import {generate} from '../library/cli/generate'

export default class Generate extends Command {
  static description = 'generate an API specification from the document file'

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
    const {args, flags} = this.parse(Generate)
    await generate(process.cwd(), args.file)
  }
}
