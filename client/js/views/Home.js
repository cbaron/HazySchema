module.exports = Object.assign( {}, require('./__proto__'), {

    fetchAndDisplay() {
        return this.getData()
        .then( () => 
            this.views[ this.model.data["@type"] ] =
                this.factory.create( this.model.data["@type"], { insertion: { value: { el: this.els.subView } }, model: { value: this.model } } )
        )
    },

    getData() {
        if( !this.model ) this.model = Object.create( this.Model )

        this.model.resource = this.path.length ? this.path.join('/') : ''
        return this.model.get()
    },

    navigate( path ) {
        this.path = path;

        ( this.model ? this.views[ this.model.data["@type"] ].delete() : Promise.resolve() )
        .then( () => this.fetchAndDisplay() )
        .catch( this.Error )
    },

    postRender() {
        //this.fetchAndDisplay().catch( this.Error )
        return this
    }

} )
