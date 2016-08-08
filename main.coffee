style = document.createElement 'style'
style.innerHTML = require "./style"

document.head.appendChild style

editor = document.createElement "div"
editor.id = "ace"
document.body.appendChild editor

aceShim = require("./ace-shim")()

aceShim.initSession "alert 'hello'", "coffee"

Postmaster = require "postmaster"

postmaster = Postmaster()

postmaster.invokeRemote('childLoaded')
