style = document.createElement 'style'
style.innerHTML = require "./style"

document.head.appendChild style

Template = require("./template")
document.body.appendChild Template()

aceShim = require("./ace-shim")()

global.editor = aceShim.aceEditor()
editor.setSession aceShim.initSession "alert 'hello'", "coffee"

Postmaster = require "postmaster"

postmaster = Postmaster()

postmaster.invokeRemote('childLoaded')
