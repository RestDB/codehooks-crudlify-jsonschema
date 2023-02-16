// use npm package to convert URL query string to MongoDB query filter
import q2m from 'query-to-mongo';
import Ajv from 'ajv';
const ajv = new Ajv({useDefaults: true});
import lodash from 'lodash';
import Debug from "debug";
const debug = Debug("codehooks-crudlify");


let Datastore = null;
let _schema = {};
let _opt = {};

/**
 * 
 * @param {object} app - Codehooks app ( npm package codehooks-js)
 * @param {object} schema - JSON schema object
 * @param {object} opt - Options for strict
 */
export default function crudlify(app, schema={}, opt={strict:false}) {
    _schema = schema;
    _opt = opt;
    try {
        Datastore = DB;
    } catch (error) {
        debug("Standalone mode:", error.message)
    }
    try {
        app.addListener((updatedApp) => {
            Datastore = updatedApp.getDatastore();
            debug('Updated app', Datastore)
        })
    } catch (error) {
        debug(error)
    }
    lodash.each(_schema, (val, key) => {
        if (val !== null){
            _schema[key] = {validate: ajv.compile(val)};
        }
    })
    // Codehooks API routes
    app.post('/:collection', createFunc);
    app.get('/:collection', readManyFunc);
    app.get('/:collection/:ID', readOneFunc);
    app.put('/:collection/:ID', updateFunc);
    app.patch('/:collection/_byquery', patchManyFunc);
    app.patch('/:collection/:ID', patchFunc);
    app.delete('/:collection/_byquery', deleteManyFunc);
    app.delete('/:collection/:ID', deleteFunc);
}

async function createFunc(req, res) {
    const {collection} = req.params;
    let document = req.body;
    const conn = await Datastore.open();
    if (_schema[collection] !== undefined) {        
        if (_schema[collection] !== null) {
            const valid = _schema[collection].validate(document);
            if (!valid) {
                return res.status(400).json(_schema[collection].validate.errors);
            } else {
                const result = await conn.insertOne(collection, document);  
                res.json(result);
            }
        } else {
            // insert with no schema
            const result = await conn.insertOne(collection, document);  
            res.json(result);
        }
    } else {
        if (Object.keys(_schema).length === 0) {
            // insert any collection name no schema definitions, anything goes
            const result = await conn.insertOne(collection, document);
            res.json(result);
        } else {
            return res.status(400).json({"error": `Collection not found ${collection}`});                
        }
    }    
}


async function readManyFunc(req, res) {
    const {collection} = req.params;
    const mongoQuery = q2m(req.query);
    if (Object.keys(_schema).length > 0 && _schema[collection] === undefined) {
        return res.status(404).send(`No collection ${collection}`)
    }
    const conn = await Datastore.open();
    const options = {
        filter: mongoQuery.criteria
    }
    if (mongoQuery.options.fields) {
        options.hints = {$fields: mongoQuery.options.fields}
    }
    if (mongoQuery.options.limit) {
        options.limit = mongoQuery.options.limit
    }
    if (mongoQuery.options.skip) {
        options.offset = mongoQuery.options.skip
    }
    conn.getMany(collection, options).json(res);  
}

async function readOneFunc(req, res) {
    const {collection, ID} = req.params;
    const conn = await Datastore.open();    
    try {
        if (Object.keys(_schema).length > 0 && _schema[collection] === undefined) {
            return res.status(404).send(`No collection ${collection}`)
        }
        const result = await conn.getOne(collection, ID);
        res.json(result);
    } catch (e) {
        res
        .status(404) // not found
        .end(e);
    }
}

async function updateFunc(req, res) {
    const {collection, ID} = req.params;
    try {
        const document = req.body;
        const conn = await Datastore.open();  
        const result = await conn.replaceOne(collection, ID, document, {}); 
        res.json(result);   
    } catch (e) {
        res
        .status(404) // not found
        .end(e);
    }
}

async function patchFunc(req, res) {
    const {collection, ID} = req.params;
    try {
        const document = req.body;
        const conn = await Datastore.open();  
        const result = await conn.updateOne(collection, ID, document, {}); 
        res.json(result);   
    } catch (e) {
        res
        .status(404) // not found
        .end(e);
    }
}

async function deleteFunc(req, res) {
    const {collection, ID} = req.params;
    try {
        const conn = await Datastore.open();  
        const result = await conn.removeOne(collection, ID, {}); 
        res.json(result);    
    } catch (e) {
        res
        .status(404) // not found
        .end(e);
    }
}
async function patchManyFunc(req, res) {
    const { collection } = req.params;
    const mongoQuery = q2m(req.query);    
    const options = {
        filter: mongoQuery.criteria
    }
    try {
        const document = req.body;
        const conn = await Datastore.open();
        const result = await conn.updateMany(collection, document, options);
        res.json(result);
    } catch (e) {
        res
            .status(404) // not found
            .end(e);
    }
}

async function deleteManyFunc(req, res) {
    const { collection } = req.params;
    const mongoQuery = q2m(req.query);    
    const options = {
        filter: mongoQuery.criteria
    }
    try {        
        const conn = await Datastore.open();
        const result = await conn.removeMany(collection, options);
        res.json(result);
    } catch (e) {
        res
            .status(404) // not found
            .end(e);
    }
}