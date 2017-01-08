#!/usr/bin/env node

/*
Company,Last Name,First Name,Title,Street,Street2,City,State,ZIP,Phone 1,Phone 2,Alt Contact,Alt Phone,Vendor Code,Vendor Account Number,Default Bill Due Days,Default Bill Discount Days,Default Bill Discount %,EMail,Website,Notes,Custom Field 1,Custom Field 2,Custom Field 3,Custom Field 4,Custom Field 5,Custom Field 6,Custom Field 7
*/

require('node-env-file')( __dirname + '/../../.env' )

const Fs = require('fs'),
      Mongo = require('../../dal/Mongo'),
      lineReader = require('readline').createInterface( {
          input: Fs.createReadStream(`${__dirname}/../bootstrap/QuickBookVendors.csv`)
      } ),
      model = {
          company: 0,
          lastName: 1,
          firstName: 2,
          address: 4,
          address2: 5,
          city: 6,
          state: 7,
          zip: 8,
          phone: 9,
          code: 13,
          email: 18,
          website: 19,
          notes: 20
      }

let Db = undefined,
    seenLineOne = false,
    chain = Mongo.getDb().then( db => Promise.resolve( Db = db ) )

lineReader.on( 'line', line => {
    if( ! seenLineOne ) return seenLineOne = true

    line = line.split(',')

    chain = chain.then( () => Db.collection('Vendor').insertOne(
        Object.keys( model ).reduce( ( memo, key ) => Object.assign( memo, { [key]: line[ model[ key ] ] } ), {} )
    ) )
} )

lineReader.on( 'close', line => {
    chain.catch( e => console.log( e.stack || e ) )
         .then( () => Db.close() )
         .catch( e => console.log( e.stack || e ) )
         .then( () => process.exit(0) )
} )
