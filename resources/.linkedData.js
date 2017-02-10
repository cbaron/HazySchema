module.exports = Object.assign( { }, require('./__proto__'), {
   
    apply( method ) {
        return this.Validate.GET( this )
           .then( () => this.Context[ method ]( this ) )
           .then( () => this[method]() )
    },

    handleWebPageElement( WebPageElement, db ) {
        const mainEntityType = WebPageElement.mainEntity[ "@type" ]
        return ( ( mainEntityType === "ItemList" )
            ? this.handleItemList( WebPageElement.mainEntity, db )
            : db.collection( mainEntityType ).findOne( WebPageElement.mainEntity._id )
              .then( entity => Promise.resolve( Object.assign( WebPageElement.mainEntity, entity ) ) )
        ).then( () => Promise.resolve( WebPageElement ) )
    },

    handleItemList( ItemList, db ) {
        const items = ItemList.itemListElement
        return Promise.all( items.map( item => db.collection( item[ "@type" ] ).findOne( { _id: item._id } ) ) )
        .then( results =>
            Promise.all(
                results.map( ( result, i ) => {
                    return ( items[i][ "@type" ] === "ItemList" )
                        ? this.handleItemList( Object.assign( items[i], result ), db )
                        : Promise.resolve( Object.assign( items[i], result ) )
                } )
            )
        ) 
    },

    GET() {
        return this.Mongo.getDb()
        .then( db =>
            db.collection( this.path[0] ).findOne( this.query )
            .then( document => this[ `handle${this.path[0]}` ]( document, db ) )
            .catch( e => { db.close(); return Promise.reject(e) } )
            .then( document => { db.close(); return Promise.resolve( document ) } )
        )
        .then( result => {
            return this.respond( {
                body: Object.assign( result, {
                    "@context": "http://schema.org",
                    "@id": this.request.url } )
            } )
        } )
    }

} )
