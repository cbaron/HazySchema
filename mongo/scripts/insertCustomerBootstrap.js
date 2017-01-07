#!/usr/bin/env node

/*
Company,Last Name,First Name,Title,Customer Type,Street,Street2,City,State,ZIP,Ship Addr Name 1,Ship Full Name 1,Ship Company 1,Ship Street2 1,Phone 1,Phone 2,Alt Contact,Alt Phone,Use With QB (Yes/No),Accept Checks (Yes/No),Use Charge Account (Yes/No),Disc %,Last Sale,Tax-exempt,EMail,EMail Notification (Yes/No),Past Due,Rewards Member (Yes/No),Customer Reward ID
*/

require('node-env-file')( __dirname + '/../../.env' )

const Fs = require('fs'),
      Mongo = require('../../dal/Mongo'),
      lineReader = require('readline').createInterface( {
          input: Fs.createReadStream(`${__dirname}/QuickBookCustomers.csv`)
      } ),
      model = {
          '1': 'lastName',
          '2': 'firstName',
          '5': 'address',
          '7': 'city',
          '8': 'state',
          '9': 'zip',
          '14': 'phoneNumber',
          '22': 'lastSale',
          '24': 'email',
          '28': 'customerRewardId'
      }

let Db = undefined,
    seen = { },
    seenLineOne = false,
    chain = Mongo.getDb( db => Promise.resolve( Db = db ) )

lineReader.on( 'line', line => {
    if( ! seenLineOne ) return seenLineOne = true

    line = line.split(',')

    const email = line[ 24 ].toLowerCase()

    if( seen[ email ] ) return

    seen[ email ] = true

    chain = chain.then( () => Db.collection('Person').insertOne( {
        lastName: line[ 1 ],
        firstName: line[ 2 ],
        address: line[ 5 ],
        city: line[ 5 ],
        state: line[ 8 ],
        zip: line[ 9 ],
        phoneNumber: line[ 14 ],
        lastSale: new Date( line[ 22 ] ),
        email,
        customerRewardId: line[ 28 ].toLowerCase()
    } ) )
} )

lineReader.on( 'close', line => {
    chain.catch( e => console.log( e.stack || e ) )
         .then( () => Db.close() )
         .then( () => process.exit(0) )
         .catch( e => console.log( e.stack || e ) )

} )
