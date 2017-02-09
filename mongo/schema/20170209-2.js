#!/usr/bin/env node

require('node-env-file')( __dirname + '/../../.env' )

const Mongo = require('mongodb')

Mongo.MongoClient.connect(process.env.MONGODB)
.then( db => 
    db.collection('WebPageElement').remove({})
    .then( () => Promise.all( [
        db.collection('MediaObject').findOne( { name: 'logo' } ).then( item => Promise.resolve( { '@type': 'MediaObject', _id: new ( Mongo.ObjectID )( item._id ) } ) ),
        db.collection('ItemList').findOne( { name: 'HeaderNavigationItemList' } ).then( item => Promise.resolve( { '@type': 'ItemList', _id: new ( Mongo.ObjectID )( item._id ) } ) ),
        db.collection('MediaObject').findOne( { name: 'profile' } ).then( item => Promise.resolve( { '@type': 'MediaObject', _id: new ( Mongo.ObjectID )( item._id ) } ) )
    ] ) )
    .then( headerItems => db.collection('WebPageElement').insertOne( {
        name: 'Header',
        mainEntity: {
            '@type': `ItemList`,
            itemListElement: headerItems
        }
    } ) )
    .catch( e => console.log( e.stack || e ) )
    .then( () => { db.close(); process.exit(0) } )
)
