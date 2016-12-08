const fs = require('fs'),
      router = require(./router')

require('node-env-file')( __dirname + '/.env' )

router.collectionPromise.then( () => 
    require('https')
        .`reateServer( { key: fs.readFileSync( process.env.SSLKEY ), cert: fs.readFileSync( process.env.SSLCERT ) }, router.handler.bind(router) )
        .listen( process.env.PORT )
)
.catch( e => {
    console.log( e.stack || e )
    process.exit(1)
} )
