# resource-x

Resource and domain modeling for quick APIs, CMSs, and applications.

![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/khalidx/resource-x.svg?style=flat-square)

![GitHub](https://img.shields.io/github/license/khalidx/resource-x.svg?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/khalidx/resource-x.svg?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/khalidx/resource-x.svg?style=flat-square)

![GitHub last commit](https://img.shields.io/github/last-commit/khalidx/resource-x.svg?style=flat-square)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@khalidx/resource-x.svg)](https://npmjs.org/package/@khalidx/resource-x)
[![Downloads/week](https://img.shields.io/npm/dw/@khalidx/resource-x.svg)](https://npmjs.org/package/@khalidx/resource-x)
[![License](https://img.shields.io/npm/l/@khalidx/resource-x.svg)](https://github.com/khalidx/resource-x/blob/master/package.json)

## Quick start

Deploy an API to the cloud **in under 30 seconds**, *in just 3 steps*.

![tutorial](./tutorial.gif)

1) Build your domain objects as JSON Schemas, all in the same Markdown document. Alternatively, run `rx init` to get a [ready-to-use document](./sample.md) with two sample schemas.
   
2) When you run `rx generate sample.md`, you'll get a full CRUD (create-read-update-delete) Swagger specification for your API.

3) You can then deploy your specification to AWS API Gateway, complete with request validation and mock responses, with a single `rx deploy sample.md` command.

How easy was that?

## Features

- Domain modeling with simple schema objects
- Markdown support for easy writing, easy sharing, and good documentation
- Generate a full CRUD Swagger REST API with a single command
- Deploy a fully mocked API to AWS API gateway with a single command
- Request validation based on your schema objects
- CLI application works on Windows, Mac, and Linux, and everywhere node is supported
- Open source + free forever, with excellent support

## Installation

Installing is easy with [npm](https://www.npmjs.com/package/@khalidx/resource-x).

```sh
npm install -g @khalidx/resource-x
```

Alternatively, you can also [download a binary](https://github.com/khalidx/resource-x/releases/latest) for your operating system.

Windows, Mac, and Linux are all supported.

## Usage

<!-- toc -->
* [resource-x](#resource-x)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @khalidx/resource-x
$ rx COMMAND
running command...
$ rx (-v|--version|version)
@khalidx/resource-x/2.0.0 darwin-x64 node-v12.16.3
$ rx --help [COMMAND]
USAGE
  $ rx COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [resource-x](#resource-x)
  - [Quick start](#quick-start)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
- [Usage](#usage-1)
- [Commands](#commands)
  - [`rx browse [FILE]`](#rx-browse-file)
  - [`rx clean [FILE]`](#rx-clean-file)
  - [`rx deploy [FILE]`](#rx-deploy-file)
  - [`rx generate [FILE]`](#rx-generate-file)
  - [`rx hello [FILE]`](#rx-hello-file)
  - [`rx help [COMMAND]`](#rx-help-command)
  - [`rx init [FILE]`](#rx-init-file)
  - [`rx undeploy [FILE]`](#rx-undeploy-file)
  - [Pro tips and tricks](#pro-tips-and-tricks)
  - [Support](#support)

## `rx browse [FILE]`

describe the command here

```
USAGE
  $ rx browse [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/browse.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/browse.ts)_

## `rx clean [FILE]`

describe the command here

```
USAGE
  $ rx clean [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/clean.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/clean.ts)_

## `rx deploy [FILE]`

describe the command here

```
USAGE
  $ rx deploy [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/deploy.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/deploy.ts)_

## `rx generate [FILE]`

describe the command here

```
USAGE
  $ rx generate [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/generate.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/generate.ts)_

## `rx hello [FILE]`

describe the command here

```
USAGE
  $ rx hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ rx hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/hello.ts)_

## `rx help [COMMAND]`

display help for rx

```
USAGE
  $ rx help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `rx init [FILE]`

describe the command here

```
USAGE
  $ rx init [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/init.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/init.ts)_

## `rx undeploy [FILE]`

describe the command here

```
USAGE
  $ rx undeploy [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/undeploy.ts](https://github.com/khalidx/resource-x/blob/v2.0.0/src/commands/undeploy.ts)_
<!-- commandsstop -->

## Pro tips and tricks

- Commit the `.rx/**/deploy.json` files. These track your AWS API Gateway deployments, so that you don't end up creating a new API every time you check out from git and deploy.

- If you've already deployed your API, then later decide to rename it (by changing the heading in the Markdown document), make sure you also rename the corresponding `.rx/` directory for the API. This will ensure that you deploy an update to the same API rather than creating a new one.

- Make sure you only use AWS API Gateway compatible schema definitions. AWS does not support the full Swagger definition language. [Read more](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-known-issues.html#api-gateway-known-issues-rest-apis) about what is supported (and what isn't) in the AWS documentation.

- You may want to do more advanced things with your API that this tool does not support. You can still use the tool to get started and generate a Swagger definition, then modify your definition by hand or with other tools before uploading to AWS manually. This will still save you some time, since writing the initial Swagger with all operations and AWS support is very time consuming.

## Support

Open a GitHub issue to ask a question, report a bug, raise a concern, or request a new feature.

Also, your question may already be answered on the following [Hacker News thread](https://news.ycombinator.com/item?id=20322759).
