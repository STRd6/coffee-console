ace.require("ace/ext/language_tools")

aceEditor = ace.edit "ace"
aceEditor.$blockScrolling = Infinity
aceEditor.setOptions
  fontSize: "16px"
  enableBasicAutocompletion: true
  enableLiveAutocompletion: true

module.exports = ->
  aceEditor: ->
    aceEditor

  initSession: (content, mode) ->
    session = ace.createEditSession(content)

    session.setMode("ace/mode/#{mode}")

    session.setUseSoftTabs true
    session.setTabSize 2

    aceEditor.setOptions
      highlightActiveLine: true

    # # Filetree observable binding
    # updating = false
    # file.content.observe (newContent) ->
    #   return if updating

    #   session.setValue newContent

    # # Bind session and file content
    # session.on "change", ->
    #   updating = true
    #   file.content session.getValue()
    #   updating = false

    return session
