module.exports = Object.create( {

    apply( resource ) { return Promise.resolve( this[ resource.request.method ]( resource ) ) },

    DELETE(){},

    GET( resource ) {
        if( resource.qs ) resource.query = JSON.parse( require('querystring').unescape( resource.qs ) )
    },

    OPTIONS() {},

    PATCH( resource ) { [ '_id', 'id' ].forEach( key => { if( resource.body[ key ] ) delete resource.body[key] } ) },

    POST(){}   
}, { } )
