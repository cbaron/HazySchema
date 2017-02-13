module.exports = p => {
    if( Object.keys( p ).length === 0 ) { return `<section></section>` }

    let rv = `<section>`;

    [ 'headline', 'text', 'spatialCoverage', 'temporalCoverage' ].forEach( datum =>
        rv += `<div class="${ datum }" data-js="${datum}">${ p[ datum ] }</div>`
    )
    
    return rv + `</section>`
}
