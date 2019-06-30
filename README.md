# resource-x

Resource and domain modeling for quick APIs, CMSs, and applications.

## Features

Deploy an API to the cloud **in under 30 seconds**, *in just 3 steps*.

1) Build your domain objects as JSON Schemas, all in the same Markdown document. Alternatively, run `rx init` to get a ready-to-use document with two sample schemas.
   
2) When you run `rx generate`, you'll get a full CRUD (create-read-update-delete) Swagger specification for your API.

3) You can then deploy your specification to AWS API Gateway, complete with request validation and mock responses, with a single `rx deploy` command.

## Usage

```sh
# Initialize a new sample project in the current directory
rx init

# Generate an API specification from the document file
rx generate <file>

# Opens the browser to view the resources in the document file
rx browse <file>

# Deploy the API with mock integration to AWS API Gateway
rx deploy <file>

# Remove the generated .rx/ directory
rx clean
```
