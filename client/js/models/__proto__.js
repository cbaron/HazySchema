module.exports = Object.assign( { }, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    get( opts={} ) {
        return this.Xhr( { method: 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify( opts.query ) : undefined } )
        .then( response => Promise.resolve( this.data = response ) )
    }

} )
