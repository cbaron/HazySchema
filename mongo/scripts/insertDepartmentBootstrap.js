#!/usr/bin/env node

/*
Department Code,Department Name,Comments,Tax Code,Margin Percent
*/

require('node-env-file')( __dirname + '/../../.env' )

const Fs = require('fs'),
      Mongo = require('../../dal/Mongo'),
      lineReader = require('readline').createInterface( {
          input: Fs.createReadStream(`${__dirname}/../bootstrap/QuickBookDepartments.csv`)
      } ),
      model = {
          name: '1'
      }

let Db = undefined,
    seen = { },
    seenLineOne = false,
    chain = Mongo.getDb().then( db => {
        db.createCollection('Department')
        return Promise.resolve( Db = db )
    } )

lineReader.on( 'line', line => {
    if( ! seenLineOne ) return seenLineOne = true

    line = line.split(',')

    const name = line[ model.name ]

    if( seen[ name ] ) return

    seen[ name ] = true

    chain = chain.then( () => Db.collection('Department').insertOne( { name } ) )
} )

lineReader.on( 'close', line => {
    chain.catch( e => console.log( e.stack || e ) )
         .then( () => Db.close() )
         .catch( e => console.log( e.stack || e ) )
         .then( () => process.exit(0) )
} )
