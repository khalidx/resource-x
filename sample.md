# A Sample API

This sample API is for managing people and teams.

## The person model

```json
{
  "person": {
    "type": "object",
    "required": [ "name", "age" ],
    "properties": {
      "name": {
        "type": "string",
        "description": "The person's full name."
      },
      "age": {
        "description": "The person's age in years, which must be equal to or greater than zero.",
        "type": "integer",
        "minimum": 0
      }
    }
  }
}
```

## The team model

A team is a group of people.

*Yes, you can also write your JSON Schemas in YAML (easier to read).*
*Yes, you can refer to other schemas (the team schema below refers to the person schema above).*

```yaml
team:
  type: object
  required:
    - name
    - people
  properties:
    name:
      type: string
      description: 'The name of the team'
    people:
      type: array
      description: 'The people on the team'
      items:
        $ref: '#/definitions/person'
```
