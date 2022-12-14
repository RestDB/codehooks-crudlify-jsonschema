# codehooks-crudlify-jsonschema
Create automatic CRUD API with [JSON schema](https://json-schema.org/learn/miscellaneous-examples.html) and persistence for a [Codehooks.io](https://codehooks.io) application.
The package [query-to-mongo](https://www.npmjs.com/package/query-to-mongo) are used to convert REST API query parameters to MongoDB queries agains the Codehooks.io datastore engine.

**Example REST API with query:**

`https://myproject-ff00.api.codehooks.io/devstore/customers?name=john&age>21`

## Install
```bash
npm i codehooks-crudlify-jsonschema codehooks-js lodash
```

## Usage

```js
/*
* Auto CRUD example using JSON schema
*/
import app from 'codehooks-js'
import crudlify from 'codehooks-crudlify-jsonschema';

// json schema per collection
const schema = {
    "customer": {
        type: "object",
        properties: {
            purchase: { type: "integer" },
            status: { type: "string" },
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

// Add CRUD routes with JSON schema
crudlify(app, schema);

// bind to serverless runtime
export default app.init();
```

## Automatic REST API
By using the `crudlify(app, schema)` function, your Codehooks.io app effectively gets a complete HTTP REST API with schema validation and data persistence.

Your Codehooks.io application will get these endpoints for any collection defined in your schema:

| Verb  | Codehooks.io route  | Description  |
|:---|---|---|
| `GET`  | https://{TENANT-ID}/{SPACE}/:collection  | Retrieve all objects (filtered by query) from a collection  |
| `GET`  | https://{TENANT-ID}/{SPACE}/:collection/:ID  | Retrieve object by ID from a collection  |
| `POST` | https://{TENANT-ID}/{SPACE}/:collection  | Add object to a collection  | 
| `PUT`  | https://{TENANT-ID}/{SPACE}/:collection/:ID  | Update object by ID in a collection  | 
|`DELETE`| https://{TENANT-ID}/{SPACE}/:collection/:ID  | Delete object by ID in a collection  | 

## Example API usage
The following examples shows how the CRUD API is used for a Codehooks.io application called `myproject-ff00` to access the data space `dev`.

```js
GET

https://myproject-ff00.api.codehooks.io/dev/customer?status=active&purchase>100

[
    {"name": "Jane", "status": "active", "purchase": 234, "_id": "18268179e4a-q3pz9of7st6kam"},
    {"name": "Joe", "status": "active", "purchase": 432, "_id": "182683fb57f-rzxrz7fdx1lrcd"}
]
```  

```js
GET

https://myproject-ff00.api.codehooks.io/dev/customer/18268179e4a-q3pz9of7st6kam

OUTPUT
{"name": "Jane", "status": "active", "purchase": 234, "_id": "18268179e4a-q3pz9of7st6kam"}
```  

```js
POST

https://myproject-ff00.api.codehooks.io/dev/customer

BODY
{"name": "Dave", "status": "active", "purchase": 0}
```  

```js
PUT

https://myproject-ff00.api.codehooks.io/dev/customer/18268fe12f5-51co7n8a40s2zp

BODY
{"purchase": 12}

OUTPUT
{
  "name": "Dave",
  "price": 12,
  "_id": "18268fe12f5-51co7n8a40s2zp"
}
```  

```js
DELETE

https://myproject-ff00.api.codehooks.io/dev/customer/18268fe12f5-51co7n8a40s2zp

OUTPUT
{
  "_id": "18268fe12f5-51co7n8a40s2zp"
}
```  

## Local development
You can also easily test out your app by [running it locally.](https://codehooks.io/docs/localdev)

Just replace the public project routes `https://myproject-ff00.api.codehooks.io` with `http://localhost:3000`.

E.g.

```js
POST

http://localhost:3000/dev/customer

BODY
{"name": "Dave", "status": "active", "purchase": 0}
```  

> A similar package using Yup Schema exists [here](https://www.npmjs.com/package/codehooks-crudlify-yup)