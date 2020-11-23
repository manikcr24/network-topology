const info = message => console.log(`INFO : ${message}`)
const debug = message => console.log(`DEBUG : ${message}`)
const warn = message => console.log(`WARN : ${message}`)

module.exports = { info, debug, warn }