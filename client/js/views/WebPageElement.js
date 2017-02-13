module.exports = Object.assign( {}, require('./__proto__'), {

    getData() {
        if( !this.model ) this.model = Object.create( this.Model, { resource: { value: this.type }, headers: { value: { accept: 'application/ld+json' } } } )

        return this.model.get( { query: { name: this.name } } )
    },

    fetchAndDisplay() {
        return this.getData()
        .then( () => {

            this.factory.create(
                this.model.data.mainEntity["@type"],
                { insertion: { value: { el: this.els.container } }, model: { value: { data: this.model.data.mainEntity } } }
            )

            if( this.model.data.image ) this.handleImage( this.model.data.image )
        } )
    },

    postRender() {
        this.fetchAndDisplay().catch( this.Error )
        return this
    },

    type: 'WebPageElement'
} )
