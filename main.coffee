style = document.createElement 'style'
style.innerHTML = require "./style"

document.head.appendChild style

Template = require("./template")
document.body.appendChild Template
  run: ->
    program = CoffeeScript.compile editor.getValue(), bare: true
    console.log program
    execWithContext program, 
      module:
        remote: remoteProxy

    Function()

aceShim = require("./ace-shim")()

global.editor = aceShim.aceEditor()
editor.setSession aceShim.initSession "alert 'hello'", "coffee"

Postmaster = require "postmaster"

postmaster = Postmaster()

postmaster.invokeRemote('childLoaded')

execWithContext = (program, context={}) ->
  module = context.module ? {}

  args = Object.keys(context)
  values = args.map (name) -> context[name]

  Function(args..., program).apply(module, values)

remoteProxy = new Proxy postmaster,
  get: (target, property, receiver) ->
    target[property] or
    (args...) ->
      target.invokeRemote property, args...
