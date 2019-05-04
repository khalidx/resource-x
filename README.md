# resource-x

Resource and domain modeling for quick APIs, CMSs, and applications.

## Usage

```sh
# Generate an API specification from the document file
rx generate <file>

# Opens the browser to view the resources in the document file
rx browse <file>

# Remove the generated .rx/ directory
rx clean
```

## Concepts

The `resource-x` API is self-hosting, and is written in itself. The concepts defined below in this page make up the `resource-x` API.

### Resource

A resource is something, anything really.

All we know is it has a name and some attributes.

```yaml
resource:
  type: object
  required:
    - name
    - attributes
  properties:
    name:
      type: string
    attributes:
      type: array
      items:
        $ref: '#/definitions/attribute'
```

### Attribute

An attribute is a named field that stores a type of content.

```yaml
attribute:
  type: object
  required:
    - name
    - type
  properties:
    name:
      type: string
    type:
      type: string
```

### Collection

A resource can belong to a collection, the plural form of the resource.

```yaml
collection:
  type: object
  required:
    - name
    - resource
  properties:
    name:
      type: string
    resource:
      $ref: '#/definitions/resource'
```
