#!/usr/bin/env node

require('node-env-file')( __dirname + '/../../.env' )

const Mongo = require('mongodb'),
      IntroText = `At Hazy Shade, disc golf is more than just a game... it's an obsession.  That's why since 2002, we've supplied the Miami Valley with the latest in disc golf gear and technology.\nWe also sponsor a number of tournaments and outings throughout the year.  Become a Hazy Shader today to get the latest scoop on all of the latest disc golf action.!`

Mongo.MongoClient.connect(process.env.MONGODB)
.then( db => 
    Promise.all( [
        db.collection('MediaObject').insertOne( { name: 'behind-basket', contentUrl: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/behind-basket.jpg` } )
            .then( result => Promise.resolve( { '@type': 'MediaObject', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),

        db.collection('WebPageElement').insertOne( { name: 'home-intro', headline: `Taking Disc Golf to a Whole New Level`, text: IntroText } )
            .then( result => Promise.resolve( { '@type': 'WebPageElement', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),
        
        db.collection('WebPageElement').insertOne( {
            name: 'home-event',
            headline: `Join us for the 10th Annual`,
            image: `https://${proecss.env.DOMAIN}:${process.env.PORT}/static/img/belmont-sun.jpg`,
            spatialCoverage: `Belmont Park / Dayton`,
            text: 'BYOP',
            temporalCoverage: `August 23-24, 2017`
        } )
        .then( result => Promise.resolve( { '@type': 'WebPageElement', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),
        
        db.collection('SiteNavigationElement').insertOne( {
            name: 'disc-doctor',
            image: `https://${proecss.env.DOMAIN}:${process.env.PORT}/static/img/basket-under-trees.jpg`,
            headline: 'Disc Doctor',
            text: 'Find the perfect disc with this guide'
        } )
        .then( result => Promise.resolve( { '@type': 'SiteNavigationElement', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),
    ] )
    .then( documents =>
        db.collection('WebPageElement').insertOne( {
            name: 'Home',
            mainEntity: {
                '@type': 'ItemList',
                itemListElement: documents
            }
        } )
    )
    .then( () =>
        Promise.all( [
            db.collection('MediaObject').find( { name: 'logo-white' } ).then( logo => Promise.resolve( { "@type": 'MediaObject', _id: new ( Mongo.ObjectID )( logo._id ) } ) ),
            db.
        db.collection('WebPageElement').insertOne( {
            name: 'Footer',
            image: `https://${proecss.env.DOMAIN}:${process.env.PORT}/static/img/hazy-tree.jpg`,
            mainEntity: {
        } )

        
            .then( result => Promise.resolve( { '@type': 'WebPageElement', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),
            
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
            
