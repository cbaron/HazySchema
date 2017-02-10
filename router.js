const RestHandler = {
    condition( request, path ) { return /application\/json/.test( request.headers.accept ) && ( this.Mongo.collections[ path[0] ] || this.resources[ path[0] ] ) },
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
            condition: function( request, path ) { return /application\/ld\+json/.test( request.headers.accept ) && this.Mongo.collections[ path[0] ] },
            method: 'ld'
        },
        RestHandler
    ],

    "OPTIONS": [ RestHandler ],
    
    "PATCH": [ RestHandler ],

    "POST": [ RestHandler ],

    "PUT": [ RestHandler ],

    cacheResources() {
        this.resources = { }

        return this.P( this.Fs.readdir, [ `${__dirname}/resources` ] )
        .then( ( [ files ] ) => 
            Promise.resolve(
                files.filter( name => !/^[\._]/.test(name) && /\.js/.test(name) )
                    .forEach( name => this.resources[ name.replace( '.js', '' ) ] = true )
            )
        )
    },

    constructor() {
        this.isDev = ( process.env.ENV === 'development' )

        this.collectionPromise = this.Mongo.getCollectionData()
        this.resourcePromise = this.cacheResources()

        return this
    },

    handleFailure( response, err, log, statusCode=500 ) {
        let message = undefined

        if( err.message === "Handled" ) return
        
        message = process.env.NODE_ENV === "production" ? "Unknown Error" : err.toString()

        if( log ) this.Error( err )

        response.writeHead( statusCode, {
            "Content-Length": Buffer.byteLength( message ),
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        } )

        response.end( message )
    },

    handler( request, response ) {
        const notFound = "Not Found"

        let path = request.url.split('/').slice(1)
            lastPath = path[ path.length - 1 ],
            queryIndex = lastPath.indexOf('?'),
            qs = ''

        if( queryIndex !== -1 ) {
            qs = lastPath.slice( queryIndex + 1 )
            path[ path.length - 1 ] = lastPath.slice( 0, queryIndex )
        }

        if( ! this[ request.method ] ) return this.handleFailure( response, notFound, false, 404 )

        request.setEncoding('utf8')

        if( this[ request.method ].find( resource => {
            if( ! Reflect.apply( resource.condition, this, [ request, path ] ) ) return false
    
            this[ resource.method ]( request, response, path, qs )
            .catch( err => this.handleFailure( response, err, true ) )

            return true
        } ) === undefined ) return this.handleFailure( response, notFound, false, 404 )
    },

    html( request, response, path ) {
        response.writeHead( 200 )
        response.end( require('./templates/page')( {
            isDev: this.isDev,
            title: process.env.NAME
        } ) )
        return Promise.resolve()
    },

    ld( request, response, path, qs ) {
        return Object.create( require(`./resources/.linkedData`), {
            request: { value: request },
            response: { value: response },
            path: { value: path },
            qs: { value: qs }
        } ).apply( request.method )
    },

    rest( request, response, path, qs ) {
        const file = this.resources[ path[0] ] ? path[0] : `__proto__`
        return Object.create( require(`./resources/${file}`), {
            request: { value: request },
            response: { value: response },
            path: { value: path },
            qs: { value: qs }
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
