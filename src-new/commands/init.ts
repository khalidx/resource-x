import {Command, flags} from '@oclif/command'

export default class Init extends Command {
  static description = 'initialize a new sample project in the current directory'

  static flags = {
    help: flags.help({char: 'h'}),
    force: flags.boolean({char: 'f'}),
  }

  static args = []

  async run() {
    const {args, flags} = this.parse(Init)
  }
}
