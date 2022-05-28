var { JSDOM } = require('jsdom')
var document = new JSDOM('', {
  url: 'http://localhost'
})
var window = document.window
Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', {
  value: 1000
})

window.jQuery = global.jQuery = global.$ = require('jquery')(window)
global.window = window
global.document = window.document
