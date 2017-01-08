#!/usr/bin/env node

/*
Item Number,Item Name,Item Description,Brief Description,Alternate Lookup,Attribute,Size,Average Unit Cost,Regular Price,MSRP,Custom Price 1,Custom Price 2,Custom Price 3,Custom Price 4,Tax Code,UPC,Order Cost,Item Type,Base Unit of Measure,Company Reorder Point,Income Account,COGS Account,Asset Account,Print Tags,Unorderable,Serial Tracking,Eligible for Commission,Department Name,Department Code,Vendor Name,Vendor Code,Manufacturer,Weight,Length,Width,Height,Qty 1,Qty 2,On Order Qty,Custom Field 1,Custom Field 2,Custom Field 3,Custom Field 4,Custom Field 5,Eligible for Rewards,Sync to Mobile,Vendor Name 2,UPC 2,Alternate Lookup 2,Order Cost 2,Vendor Name 3,UPC 3,Alternate Lookup 3,Order Cost 3,Vendor Name 4,UPC 4,Alternate Lookup 4,Order Cost 4,Vendor Name 5,UPC 5,Alternate Lookup 5,Order Cost 5,Reorder Point 1,Reorder Point 2
*/

require('node-env-file')( __dirname + '/../../.env' )

const Fs = require('fs'),
      Mongo = require('../../dal/Mongo'),
      lineReader = require('readline').createInterface( {
          input: Fs.createReadStream(`${process.argv[2]}`)
      } ),
      model = {
          quickBooksId: 0,
          name: 1,
          color: 5,
          weight: 6,
          averageUnitCost: 7,
          regularPrice: 8,
          customPrice1: 9,
          customPrice2: 11,
          tax: 13,
          orderCost: 15,
          department: 26,
          vendor: 28,
          quantity1: 35,
          quantity2: 36
      }

let Db = undefined,
    seen = { },
    seenLineOne = false,
    chain = Mongo.getDb().then( db => Promise.resolve( Db = db ) )

lineReader.on( 'line', line => {
    if( ! seenLineOne ) return seenLineOne = true

    line = line.split(',')

    const quickBooksId = line[ model.quickBooksId ]

    if( seen[ quickBooksId ] ) return

    seen[ quickBooksId ] = true

    chain = chain.then( () => Db.collection('Inventory').insertOne(
        Object.keys( model ).reduce( ( memo, key ) => Object.assign( memo, { key: line[ model[ key ] ] } ), {} )
    ) )
} )

lineReader.on( 'close', line => {
    chain.catch( e => console.log( e.stack || e ) )
         .then( () => Db.close() )
         .catch( e => console.log( e.stack || e ) )
         .then( () => process.exit(0) )
} )
