# The Contacts API

Here's how a contact should be defined:

```yaml
contact:
  type: object
  required:
    - name
  properties:
    name:
      type: string
      description: The contact's full name
    email:
      type: string
      description: The contact's email address
    phone:
      type: string
      description: The contact's phone number
```
