#!/usr/bin/env node

require('node-env-file')( __dirname + '/../../.env' );

const Mongo = require('mongodb')

Mongo.MongoClient.connect(process.env.MONGODB)
.then( db => 
    db.createCollection('Person')
    .then( () => db.createCollection('Department') )
    .then( () => db.createCollection('Inventory') )
    .then( () => db.createCollection('Vendor') )
    .then( () => db.createCollection('WebPageElement') )
    .then( () => db.createCollection('MediaObject') )
    .then( () => db.collection('MediaObject').insertMany( [
        {
            name: 'logo-white',
            contentUrl: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/logo-white.svg`
        },
        {
            name: 'profile',
            contentUrl: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/profile.svg`
        },
    ] ) )
    .then( () => db.createCollection('SiteNavigationElement') )
    .then( () => db.collection('SiteNavigationElement').insertMany( [
        {
            "name": 'shop',
            "target": {
                "urlTemplate": `https://${process.env.DOMAIN}:${process.env.PORT}/shop`
            }
        },
        {
            "name": 'courses',
            "target": {
                "urlTemplate": `https://${process.env.DOMAIN}:${process.env.PORT}/courses`
            }
        },
        {
            "name": 'events',
            "target": {
                "urlTemplate": `https://${process.env.DOMAIN}:${process.env.PORT}/events`
            }
        },
        {
            "name": 'about',
            "target": {
                "urlTemplate": `https://${process.env.DOMAIN}:${process.env.PORT}/about`
            }
        }
    ] ) )
    .then( () => db.createCollection('ItemList') )
    .then( () => Promise.all( [ 'shop', 'courses', 'events', 'about' ].map( name => db.collection('SiteNavigationElement').findOne( { name } ) ) ) )
    .then( navigationElements => db.collection('ItemList').insertOne( {
            name: 'HeaderNavigationItemList',
            itemListElement: navigationElements.map( element => new ( require('mongodb').ObjectID )( element._id ) )
    } ) )
    .catch( e => console.log( e.stack || e ) )
    .then( () => { db.close(); process.exit(0) } )
)
