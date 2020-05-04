#!/usr/bin/env node

import program from 'commander'
import debug from 'debug'

import { log } from './cli/log'
import { showBanner } from './cli/banner'
import { init } from './cli/init'
import { generate } from './cli/generate'
import { browse } from './cli/browse'
import { deploy } from './cli/deploy'
import { undeploy } from './cli/undeploy'
import { clean } from './cli/clean'

/**
 * Logs and exits with a non-zero status code on error.
 * @param error the error object
 */
async function onError (error: any): Promise<void> {
  // If debug is on, log the entire error object, otherwise log just the message
  log('error', debug.enabled('rx:cli') ? error : error.message)
  process.exit(1)
}

program
  .version(require('../../package.json').version)

program
  .option('-d, --debug', 'Show debug-level "verbose" output while running commands')
  .on('option:debug', () => debug.enable('rx:cli'))

program
  .command('init')
  .description('initialize a new sample project in the current directory')
  .action((cmd) => showBanner().then(() => init(process.cwd()).catch(onError)))

program
  .command('generate <file>')
  .description('generate an API specification from the document file')
  .action((file, cmd) => showBanner().then(() => generate(process.cwd(), file).catch(onError)))

program
  .command('browse <file>')
  .description('opens the browser to view the resources in the document file')
  .action((file, cmd) => showBanner().then(() => browse(process.cwd(), file).catch(onError)))

program
  .command('deploy <file>')
  .description('deploy the API with mock integration to AWS API Gateway')
  .action((file, cmd) => showBanner().then(() => deploy(process.cwd(), file).catch(onError)))

program
  .command('undeploy <file>')
  .description('undeploy the API from AWS API Gateway')
  .action((file, cmd) => showBanner().then(() => undeploy(process.cwd(), file).catch(onError)))

program
  .command('clean')
  .description('remove the generated .rx/ directory')
  .action((cmd) => showBanner().then(() => clean(process.cwd()).catch(onError)))
   
program.on('command:*', function () {
  onError(new Error(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`))
})

program
  .parse(process.argv)
 