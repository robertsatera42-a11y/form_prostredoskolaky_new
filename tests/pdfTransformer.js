const path = require('path')

module.exports = {
  process (source, filename) {
    return `module.exports = ${JSON.stringify('/documents/' + path.basename(filename))}`
  }
}
