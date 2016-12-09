const RestHandler = {
    condition( request, path ) { return /application\/json/.test( request.headers.accept ) && this.Mongo.collections[ path[0] ] },
    method: 'rest'
}

module.exports = Object.create( Object.assign( {}, require('./lib/MyObject'), {

    Fs: require('fs'),

    Mongo: require('./dal/Mongo'),

    Path: require('path'),
    
    "DELETE": [ RestHandler ],

    "GET": [
        {
            condition: ( request, path ) => ( path[0] === "static" ) || path[0] === "favicon.ico",
            method: 'static'
        }, {
            condition: ( request, path ) => /text\/html/.test( request.headers.accept ),
            method: 'html'
        }, {
            condition: ( request, path ) => /application\/ld\+json/.test( request.headers.accept ),
            method: 'rest'
        },
        RestHandler
    ],

    "OPTIONS": [ RestHandler ],
    
    "PATCH": [ RestHandler ],

    "POST": [ RestHandler ],

    "PUT": [ RestHandler ],

    constructor() {
        this.isDev = ( process.env.ENV === 'development' )

        this.collectionPromise = this.Mongo.getCollectionData()

        return this
    },

    handleFailure( response, err, log, statusCode=500 ) {
        let message = undefined

        if( err.message === "Handled" ) return
        
        message = process.env.NODE_ENV === "production" ? "Unknown Error" : err

        if( log ) this.Error( err )

        response.writeHead( statusCode, {
            "Content-Length": Buffer.byteLength( message ),
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        } )

        response.end( message )
    },

    handler( request, response ) {
        const path = request.url.split('/').slice(1),
              notFound = "Not Found"
        let routeFound

        if( ! this[ request.method ] ) return this.handleFailure( response, notFound, false, 404 )

        request.setEncoding('utf8')

        routeFound = this[ request.method ].find( resource => {
            if( ! Reflect.apply( resource.condition, this, [ request, path ] ) ) return false
        
            this[ resource.method ]( request, response, path )
            .catch( err => this.handleFailure( response, err, true ) )

            return true
        } )

        if( routeFound === undefined ) return this.handleFailure( response, notFound, false, 404 )
    },

    html( request, response, path ) {
        response.writeHead( 200 )
        response.end( require('./templates/page')( {
            isDev: this.isDev,
            title: process.env.NAME
        } ) )
        return Promise.resolve()
    },

    rest( request, response, path ) {
        return Object.create( require(`./resource`), {
            request: { value: request },
            response: { value: response },
            path: { value: path }
        } ).apply( request.method )
    },

    static( request, response, path ) {
        var fileName = path.pop(),
            filePath = `${__dirname}/${path.join('/')}/${fileName}`,
            ext = this.Path.extname( filePath )

        return this.P( this.Fs.stat, [ filePath ] )
        .then( ( [ stat ] ) => new Promise( ( resolve, reject ) => {
            
            var stream = this.Fs.createReadStream( filePath )
            
            response.on( 'error', e => { stream.end(); reject(e) } )
            stream.on( 'error', reject )
            stream.on( 'end', () => {
                response.end();
                resolve()
            } )

            response.writeHead(
                200,
                {
                    'Connection': 'keep-alive',
                    'Content-Encoding': ext === ".gz" ? 'gzip' : 'identity',
                    'Content-Length': stat.size,
                    'Content-Type':
                        /\.css/.test(fileName)
                            ? 'text/css'
                            : ext === '.svg'
                                ? 'image/svg+xml'
                                : 'text/plain'
                }
            )
            stream.pipe( response, { end: false } )
        } ) )
    }

} ) ).constructor()
