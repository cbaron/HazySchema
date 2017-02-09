#!/usr/bin/env node

require('node-env-file')( __dirname + '/../../.env' )

const Mongo = require('mongodb')

Mongo.MongoClient.connect(process.env.MONGODB)
.then( db => 
    Promise.all( [ 'shop', 'courses', 'events', 'about' ].map( name => db.collection('SiteNavigationElement').findOne( { name } ) ) )
    .then( navigationElements => db.collection('ItemList').insertOne( {
            name: 'HeaderNavigationItemList',
            itemListElement: navigationElements.map( element => ( { "@type": 'SiteNavigationElement', "_id": new ( Mongo.ObjectID )( element._id ) } ) )
    } ) )
    .catch( e => console.log( e.stack || e ) )
    .then( () => { db.close(); process.exit(0) } )
)
