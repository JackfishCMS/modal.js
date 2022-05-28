const pug = require('pug')
const fs = require('fs')
const { join } = require('path')

const pugSrc = fs.readFileSync(join(__dirname, './modal-template.pug'), 'utf8')
const compiledCode =
  `var pug = require('pug-runtime');\n` +
  pug.compileClient(pugSrc, {
    externalRuntime: true,
    compileDebug: false,
    inlineRuntimeFunctions: false
  }) +
  '\nmodule.exports = template;'

fs.writeFileSync(join(__dirname, './modal-template.js'), compiledCode)
