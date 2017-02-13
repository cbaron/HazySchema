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
            image: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/belmont-sun.jpg`,
            spatialCoverage: `Belmont Park / Dayton`,
            text: 'BYOP',
            temporalCoverage: `August 23-24, 2017`
        } )
        .then( result => Promise.resolve( { '@type': 'WebPageElement', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) ),
        
        db.collection('SiteNavigationElement').insertOne( {
            name: 'disc-doctor',
            image: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/basket-under-trees.jpg`,
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
            db.collection('MediaObject').findOne( { name: 'logo-white' } ).then( logo => Promise.resolve( { "@type": 'MediaObject', _id: new ( Mongo.ObjectID )( logo._id ) } ) ),

            db.createCollection('LocalBusiness')
            .then( () =>
                db.collection('LocalBusiness').insertOne( {
                    openingHours: `Mon - Sat 11am - 8pm\nSun 12pm-7pm`,
                    address: {
                        streetAddress: `723 Watervliet Ave`,
                        addressLocality: 'Dayton',
                        addressRegion: 'OH',
                        postalCode: '45420'
                    },
                    email: `hazyshade@gmail.com`,
                    name: `Hazy Shade Disc Golf`,
                    telephone: `(937) 256-2690`,
                    sameAs: [
                        `https://www.facebook.com/Hazy-Shade-Disc-Golf-And-More-173084619405424`
                    ]
                } ).then( result => Promise.resolve( { "@type": 'LocalBusiness', _id: new ( Mongo.ObjectID )( result.insertedId ) } ) )
            )
        ] )
        .then( documents =>
            db.collection('WebPageElement').insertOne( {
                name: 'Footer',
                image: `https://${process.env.DOMAIN}:${process.env.PORT}/static/img/hazy-tree.png`,
                mainEntity: {
                    '@type': 'ItemList',
                    itemListElement: documents
                }
            } )
        )
    )
    .catch( e => console.log( e.stack || e ) )
    .then( () => { db.close(); process.exit(0) } )
)
