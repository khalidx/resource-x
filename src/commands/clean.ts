import {Command, flags} from '@oclif/command'
import {clean} from '../library/cli/clean'

export default class Clean extends Command {
  static description = 'remove the generated .rx/ directory'

  static flags = {
    help: flags.help({char: 'h'}),
    force: flags.boolean({char: 'f'}),
  }

  static args = []

  async run() {
    const {args, flags} = this.parse(Clean)
    await clean(process.cwd())
  }
}