module.exports = Object.assign( {}, require('./__proto__'), {

    display() {

        if( this.model.data.mainEntity ) {
            this.factory.create(
                this.model.data.mainEntity["@type"],
                { insertion: { value: { el: this.els.container } }, model: { value: { data: this.model.data.mainEntity } } }
            )
        }
            
        if( this.model.data.image ) this.handleImage( this.model.data.image )

        return Promise.resolve()
    },

    fetch() {
        return this.model
            ? Promise.resolve()
            : this.getData()
    },

    getData() {
        this.model = Object.create( this.Model, { resource: { value: this.type }, headers: { value: { accept: 'application/ld+json' } } } )

        return this.model.get( { query: { name: this.name } } )
    },

    handleImage( url ) {
        this.els.container.style.backgroundImage = `url(${ url })`
    }, 

    postRender() {

        this.fetch().then( () => this.display() ).catch( this.Error )

        return this
    },

    type: 'WebPageElement'
} )
