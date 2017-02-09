module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        signoutBtn: 'click'
    },

    onUser() {
        return this
    },

    postRender() {
        this.fetchAndDisplay().catch( this.Error )
        return this
    },

    requiresLogin: false,
    
    signout() {

        document.cookie = `${window.cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

        this.user.data = { }

        this.emit('signout')

    },

    type: 'WebPageElement'

} )
