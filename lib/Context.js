module.exports = Object.create( {

    apply( resource ) { return Promise.resolve( this[ resource.request.method ]( resource ) ) },

    DELETE(){},

    GET( resource ) {
        //TODO: Validate qs
        resource.query = JSON.parse( require('querystring').parse( resource.parsedUrl.query ).qs )
        console.log(resource.query);
    },

    OPTIONS() {},

    PATCH( resource ) { [ '_id', 'id' ].forEach( key => { if( resource.body[ key ] ) delete resource.body[key] } ) },

    POST(){}   
}, { } )
