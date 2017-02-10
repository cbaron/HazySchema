module.exports = p => `<ul>${Array.from( Array( p.itemListElement.length ).keys() ).map( n => `<li></li>` ).join('')}</ul>`
