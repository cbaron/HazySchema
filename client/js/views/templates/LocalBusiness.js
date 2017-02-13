module.exports = p =>
`<div>
    <div>${p.name}</div>
    <div>${p.address.streetAddress}</div>
    <div>
        <span>${p.address.addressLocality}</span>
        <span>${p.address.addressRegion}</span>
        <span>${p.address.postalCode}</span>
    </div>
    <div>${p.telephone}</div>
    <div>${p.openingHours}</div>
    <div data-js="social"></div>
</div>`
