module.exports = Object.create( {

    create( name, opts ) {
        name = name.charAt(0).toUpperCase() + name.slice(1)
        return Object.create(
            this.Views[ name ],
            Object.assign( {
                name: { value: name },
                factory: { value: this },
                template: { value: this.Templates[ name ] },
                user: { value: this.User }
                }, opts )
        ).constructor()
        .on( 'navigate', route => require('../router').navigate( route ) )
    },

}, {
    Templates: { value: require('../.TemplateMap') },
    User: { value: require('../models/User' ) },
    Views: { value: require('../.ViewMap') }
} )
