# codehooks-crudlify-jsonschema
Create automatic CRUD API with JSON schema and persistence for an Codehooks.io application.

## Install
```bash
npm i codehooks-crudlify-jsonschema ajv -s
```

## Code example

```js

/*
* Auto CRUD example using JSON schema
*/
import { app } from 'codehooks-js'
import crudlify from './crudlify-json-schema';

// json schema per collection
const schema = {
    "customer": {
        type: "object",
        properties: {
            age: { type: "integer" },
            name: { type: "string" }
        },
        required: ["name"],
        additionalProperties: false
    },
    "product": {
        type: "object",
        properties: {
            price: { type: "integer" },
            name: { type: "string" }
        },
        required: ["name"],
        additionalProperties: false
    }
}

// Add CRUD routes with yup schema
crudlify(app, schema, {strict: true});

// bind to serverless runtime
export default app.init();

```
