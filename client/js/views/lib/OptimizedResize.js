module.exports = Object.create( {

    add(callback) {
        if( !this.callbacks.length ) window.addEventListener('resize', this.onResize)
        this.callbacks.push(callback)
    },

    onResize() {
       if( this.running ) return

        this.running = true
        
        window.requestAnimationFrame
            ? window.requestAnimationFrame( this.runCallbacks )
            : setTimeout( this.runCallbacks, 66)
    },

    runCallbacks() {
        this.callbacks = this.callbacks.filter( callback => callback() )
        this.running = false 
    }

}, { callbacks: { value: [] }, running: { value: false } } ).add
