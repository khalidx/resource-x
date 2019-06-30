# resource-x

Resource and domain modeling for quick APIs, CMSs, and applications.

![GitHub](https://img.shields.io/github/license/khalidx/resource-x.svg?style=flat-square)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/khalidx/resource-x.svg?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/khalidx/resource-x.svg?style=flat-square)

## Features

Deploy an API to the cloud **in under 30 seconds**, *in just 3 steps*.

![tutorial](./tutorial.gif)

1) Build your domain objects as JSON Schemas, all in the same Markdown document. Alternatively, run `rx init` to get a [ready-to-use document](./sample.md) with two sample schemas.
   
2) When you run `rx generate`, you'll get a full CRUD (create-read-update-delete) Swagger specification for your API.

3) You can then deploy your specification to AWS API Gateway, complete with request validation and mock responses, with a single `rx deploy` command.

## Usage

Initialize a new sample project in the current directory.

```sh
rx init
```
Generate an API specification from the document file.

```sh
rx generate <file>
```

Opens the browser to view the resources in the document file.

```sh
rx browse <file>
```

Deploy the API with mock integration to AWS API Gateway.

```sh
rx deploy <file>
```

Output the deployment files without actually deploying.

This is useful when planning to use Cloudformation or Terraform to do the actual deployment.

```sh
rx output <file>
```

Undeploy the API from AWS API Gateway.

```sh
rx undeploy <file>
```

Remove the generated .rx/ directory.

```sh
rx clean
```

See help and usage information about all available commands.

```sh
rx --help
```

## Support

Open a GitHub issue to ask a question, report a bug, raise a concern, or request a new feature.
