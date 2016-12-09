module.exports = Object.create( {

    Error: require('../../lib/MyError'),
    
    User: require('./models/User'),

    ViewFactory: require('./factory/View'),

    initialize() {
        this.contentContainer = document.querySelector('#content')

        window.onpopstate = this.handle.bind(this)

        this.header = this.ViewFactory.create( 'header', { insertion: { value: { el: this.contentContainer, method: 'insertBefore' } } } )

        this.User.get().then( () => {
        
            this.header.onUser()
            .on( 'signout', () => 
                Promise.all( Object.keys( this.views ).map( name => this.views[ name ].delete() ) )
                .then( () => this.navigate( 'home' ) )
            )

            this.handle()

        } ).catch( this.Error )

        return this
    },

    handle() {
        this.handler( window.location.pathname.split('/').slice(1) )
    },

    handler( path ) {
        const view = /verify/.test( path ) ? 'verify' : 'home'

        if( this.views[ view ] ) return this.views[ view ].navigate( path )
        
        return Promise.resolve(
            this.views[ view ] =
                this.ViewFactory.create( view, {
                    insertion: { value: { el: this.contentContainer } },
                    path: { value: path, writable: true }
                } )
        )
    },

    navigate( location ) {
        history.pushState( {}, '', location )
        this.handle()
    }

}, { views: { value: { } } } )
