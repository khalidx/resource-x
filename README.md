# resource-x

Resource and domain modeling for quick APIs, CMSs, and applications.

## Currently Supported

- Write a markdown document with some JSON schemas
  - get a Swagger spec and deployable mock API for free
    - the API is deployable to AWS

## Usage

```sh
# Generate an API specification from the document file
rx generate <file>

# Opens the browser to view the resources in the document file
rx browse <file>

# Deploy the API with mock integration to AWS API Gateway
rx deploy <file>

# Remove the generated .rx/ directory
rx clean
```
