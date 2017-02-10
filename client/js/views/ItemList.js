module.exports = Object.assign( {}, require('./__proto__'), {

    postRender() {
        const children = this.els.container.children
        this.model.data.itemListElement.forEach( ( item, i ) =>
            this.factory.create(
                item[ "@type" ],
                { insertion: { value: { el: children[i] } }, model: { value: { data: item } } }
            )
        )

        return this
    }

} )
