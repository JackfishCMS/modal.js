var { JSDOM } = require('jsdom')
var document = new JSDOM('', { url: 'http://localhost' })
var window = document.window

window.jQuery = global.jQuery = global.$ = require('jquery')(window)
global.window = window
global.document = window.document
