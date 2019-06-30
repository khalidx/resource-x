#!/usr/bin/env node

import * as fse from 'fs-extra'
import * as path from 'path'
import * as program from 'commander'
import * as rx from './index'
import * as express from 'express'
import * as swaggerUi from 'swagger-ui-express'
import * as open from 'open'

program
  .command('init')
  .description('initialize a new sample project in the current directory')
  .action(function (cmd) {
    let document = fse.readFileSync(path.join(__dirname, '../sample.md'))
    fse.writeFileSync(path.join(process.cwd(), 'sample.md'), document)
  })

program
  .command('generate <file>')
  .description('generate an API specification from the document file')
  .action(function (file, cmd) {
    let absolute = path.resolve(file)
    let directory = path.join(path.dirname(absolute), '.rx/')
    let document = fse.readFileSync(absolute).toString()
    rx
    .documentToSwagger(document)
    .then((specification) => {
      fse.ensureDirSync(directory)
      fse.writeFileSync(path.join(directory, 'swagger.json'), JSON.stringify(specification, null, 2))
      fse.writeFileSync(path.join(directory, '.gitignore'), '# Ignoring this directory\n*\n')
    })
    .catch((error) => console.error(error))
  })

program
  .command('browse <file>')
  .description('opens the browser to view the resources in the document file')
  .action(function (file, cmd) {
    let absolute = path.resolve(file)
    let directory = path.join(path.dirname(absolute), '.rx/')
    let swagger = path.join(directory, 'swagger.json')
    if (!fse.existsSync(swagger)) {
      console.error('The .rx/swagger.json file does not exist. Run the generate command first.')
      return
    }
    let specification = JSON.parse(fse.readFileSync(swagger).toString())
    let app = express()
    let port = 8080
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification))
    app.listen(port, () => {
      console.log(`swagger-ui listening on port ${port}`)
      open(`http://localhost:${port}/api-docs`)
    })
  })

program
  .command('deploy <file>')
  .description('deploy the API with mock integration to AWS API Gateway')
  .action(function (file, cmd) {
    let absolute = path.resolve(file)
    let directory = path.join(path.dirname(absolute), '.rx/')
    let swagger = path.join(directory, 'swagger.json')
    if (!fse.existsSync(swagger)) {
      console.error('The .rx/swagger.json file does not exist. Run the generate command first.')
      return
    }
    let specification = JSON.parse(fse.readFileSync(swagger).toString())
    rx
    .swaggerToSwaggerMock(specification)
    .then((specification) => {
      fse.ensureDirSync(directory)
      fse.writeFileSync(path.join(directory, 'swagger.mock.json'), JSON.stringify(specification, null, 2))
    })
    .then(() => rx.swaggerToApiGateway(specification))
    .catch((error) => console.error(error))
  })

program
  .command('output <file>')
  .description('output the deployment files without actually deploying')
  .action(function (file, cmd) {
    console.error('Not yet implemented.')
  })

program
  .command('undeploy <file>')
  .description('undeploy the API from AWS API Gateway')
  .action(function (file, cmd) {
    console.error('Not yet implemented.')
  })

program
  .command('clean')
  .description('remove the generated .rx/ directory')
  .action(function (cmd) {
    fse.removeSync(path.join(process.cwd(), '.rx/'))
  })

program.parse(process.argv)
