(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "MIT License\n\nCopyright (c) 2016 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "# coffee-console\nAn embeddable CoffeeScript console\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "style = document.createElement 'style'\nstyle.innerHTML = require \"./style\"\n\ndocument.head.appendChild style\n\nTemplate = require(\"./template\")\ndocument.body.appendChild Template\n  run: ->\n    program = CoffeeScript.compile editor.getValue(), bare: true\n    console.log program\n    execWithContext program, \n      module:\n        remote: remoteProxy\n\n    Function()\n\naceShim = require(\"./ace-shim\")()\n\nglobal.editor = aceShim.aceEditor()\neditor.setSession aceShim.initSession \"alert 'hello'\", \"coffee\"\n\nPostmaster = require \"postmaster\"\n\npostmaster = Postmaster()\n\npostmaster.invokeRemote('childLoaded')\n\nexecWithContext = (program, context={}) ->\n  module = context.module ? {}\n\n  args = Object.keys(context)\n  values = args.map (name) -> context[name]\n\n  Function(args..., program).apply(module, values)\n\nremoteProxy = new Proxy postmaster,\n  get: (target, property, receiver) ->\n    target[property] or\n    (args...) ->\n      target.invokeRemote property, args...\n",
      "mode": "100644"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "title: \"Coffee Console\"\ndescription: \"\"\"\n  An embeddable CoffeeScirpt console.\n\"\"\"\nversion: \"0.1.0\"\nentryPoint: \"main\"\nremoteDependencies: [\n  \"https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ace.js\"\n  \"https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ext-language_tools.js\"\n  \"https://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js\"\n]\ndependencies:\n  postmaster: \"distri/postmaster:v0.5.0\"\n",
      "mode": "100644"
    },
    "ace-shim.coffee": {
      "path": "ace-shim.coffee",
      "content": "ace.require(\"ace/ext/language_tools\")\n\naceEditor = ace.edit \"ace\"\naceEditor.$blockScrolling = Infinity\naceEditor.setOptions\n  fontSize: \"16px\"\n  enableBasicAutocompletion: true\n  enableLiveAutocompletion: true\n\nmodule.exports = ->\n  aceEditor: ->\n    aceEditor\n\n  initSession: (content, mode) ->\n    session = ace.createEditSession(content)\n\n    session.setMode(\"ace/mode/#{mode}\")\n\n    session.setUseSoftTabs true\n    session.setTabSize 2\n\n    aceEditor.setOptions\n      highlightActiveLine: true\n\n    # # Filetree observable binding\n    # updating = false\n    # file.content.observe (newContent) ->\n    #   return if updating\n\n    #   session.setValue newContent\n\n    # # Bind session and file content\n    # session.on \"change\", ->\n    #   updating = true\n    #   file.content session.getValue()\n    #   updating = false\n\n    return session\n",
      "mode": "100644"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html, body, #ace, application\n  height: 100%\n\napplication\n  display: block\n\nbody\n  font-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif\n  font-weight: 300\n  margin: 0\n\nbutton.run\n  position: absolute\n  top: 8px\n  right: 8px\n  z-index: 1\n",
      "mode": "100644"
    },
    "template.jadelet": {
      "path": "template.jadelet",
      "content": "application\n  #ace\n  button.run(click=@run) Run\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var Postmaster, Template, aceShim, execWithContext, postmaster, remoteProxy, style,\n    __slice = [].slice;\n\n  style = document.createElement('style');\n\n  style.innerHTML = require(\"./style\");\n\n  document.head.appendChild(style);\n\n  Template = require(\"./template\");\n\n  document.body.appendChild(Template({\n    run: function() {\n      var program;\n      program = CoffeeScript.compile(editor.getValue(), {\n        bare: true\n      });\n      console.log(program);\n      execWithContext(program, {\n        module: {\n          remote: remoteProxy\n        }\n      });\n      return Function();\n    }\n  }));\n\n  aceShim = require(\"./ace-shim\")();\n\n  global.editor = aceShim.aceEditor();\n\n  editor.setSession(aceShim.initSession(\"alert 'hello'\", \"coffee\"));\n\n  Postmaster = require(\"postmaster\");\n\n  postmaster = Postmaster();\n\n  postmaster.invokeRemote('childLoaded');\n\n  execWithContext = function(program, context) {\n    var args, module, values, _ref;\n    if (context == null) {\n      context = {};\n    }\n    module = (_ref = context.module) != null ? _ref : {};\n    args = Object.keys(context);\n    values = args.map(function(name) {\n      return context[name];\n    });\n    return Function.apply(null, __slice.call(args).concat([program])).apply(module, values);\n  };\n\n  remoteProxy = new Proxy(postmaster, {\n    get: function(target, property, receiver) {\n      return target[property] || function() {\n        var args;\n        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n        return target.invokeRemote.apply(target, [property].concat(__slice.call(args)));\n      };\n    }\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"title\":\"Coffee Console\",\"description\":\"An embeddable CoffeeScirpt console.\",\"version\":\"0.1.0\",\"entryPoint\":\"main\",\"remoteDependencies\":[\"https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ace.js\",\"https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ext-language_tools.js\",\"https://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js\"],\"dependencies\":{\"postmaster\":\"distri/postmaster:v0.5.0\"}};",
      "type": "blob"
    },
    "ace-shim": {
      "path": "ace-shim",
      "content": "(function() {\n  var aceEditor;\n\n  ace.require(\"ace/ext/language_tools\");\n\n  aceEditor = ace.edit(\"ace\");\n\n  aceEditor.$blockScrolling = Infinity;\n\n  aceEditor.setOptions({\n    fontSize: \"16px\",\n    enableBasicAutocompletion: true,\n    enableLiveAutocompletion: true\n  });\n\n  module.exports = function() {\n    return {\n      aceEditor: function() {\n        return aceEditor;\n      },\n      initSession: function(content, mode) {\n        var session;\n        session = ace.createEditSession(content);\n        session.setMode(\"ace/mode/\" + mode);\n        session.setUseSoftTabs(true);\n        session.setTabSize(2);\n        aceEditor.setOptions({\n          highlightActiveLine: true\n        });\n        return session;\n      }\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html,\\nbody,\\n#ace,\\napplication {\\n  height: 100%;\\n}\\napplication {\\n  display: block;\\n}\\nbody {\\n  font-family: \\\"HelveticaNeue-Light\\\", \\\"Helvetica Neue Light\\\", \\\"Helvetica Neue\\\", Helvetica, Arial, \\\"Lucida Grande\\\", sans-serif;\\n  font-weight: 300;\\n  margin: 0;\\n}\\nbutton.run {\\n  position: absolute;\\n  top: 8px;\\n  right: 8px;\\n  z-index: 1;\\n}\\n\";",
      "type": "blob"
    },
    "template": {
      "path": "template",
      "content": "module.exports = function(data) {\n  \"use strict\";\n  return (function() {\n    var __root;\n    __root = require(\"/lib/hamlet-runtime\")(this);\n    __root.buffer(__root.element(\"application\", this, {}, function(__root) {\n      __root.buffer(__root.element(\"div\", this, {\n        id: [\"ace\"]\n      }, function(__root) {}));\n      __root.buffer(__root.element(\"button\", this, {\n        \"class\": [\"run\"],\n        \"click\": this.run\n      }, function(__root) {\n        __root.buffer(\"Run\\n\");\n      }));\n    }));\n    return __root.root;\n  }).call(data);\n};\n",
      "type": "blob"
    },
    "lib/hamlet-runtime": {
      "path": "lib/hamlet-runtime",
      "content": "(function(f){if(typeof exports===\"object\"&&typeof module!==\"undefined\"){module.exports=f()}else if(typeof define===\"function\"&&define.amd){define([],f)}else{var g;if(typeof window!==\"undefined\"){g=window}else if(typeof global!==\"undefined\"){g=global}else if(typeof self!==\"undefined\"){g=self}else{g=this}g.HamletRuntime = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n// Generated by CoffeeScript 1.7.1\n(function() {\n  \"use strict\";\n  var Observable, Runtime, bindEvent, bindObservable, bufferTo, classes, createElement, empty, eventNames, get, id, isEvent, isFragment, makeElement, observeAttribute, observeAttributes, observeContent, specialBindings, valueBind, valueIndexOf;\n\n  Observable = require(\"o_0\");\n\n  eventNames = \"abort\\nblur\\nchange\\nclick\\ncontextmenu\\ndblclick\\ndrag\\ndragend\\ndragenter\\ndragexit\\ndragleave\\ndragover\\ndragstart\\ndrop\\nerror\\nfocus\\ninput\\nkeydown\\nkeypress\\nkeyup\\nload\\nmousedown\\nmousemove\\nmouseout\\nmouseover\\nmouseup\\nreset\\nresize\\nscroll\\nselect\\nsubmit\\ntouchcancel\\ntouchend\\ntouchenter\\ntouchleave\\ntouchmove\\ntouchstart\\nunload\".split(\"\\n\");\n\n  isEvent = function(name) {\n    return eventNames.indexOf(name) !== -1;\n  };\n\n  isFragment = function(node) {\n    return (node != null ? node.nodeType : void 0) === 11;\n  };\n\n  valueBind = function(element, value, context) {\n    Observable(function() {\n      var update;\n      value = Observable(value, context);\n      switch (element.nodeName) {\n        case \"SELECT\":\n          element.oninput = element.onchange = function() {\n            var optionValue, _ref, _value;\n            _ref = this.children[this.selectedIndex], optionValue = _ref.value, _value = _ref._value;\n            return value(_value || optionValue);\n          };\n          update = function(newValue) {\n            var options;\n            element._value = newValue;\n            if ((options = element._options)) {\n              if (newValue.value != null) {\n                return element.value = (typeof newValue.value === \"function\" ? newValue.value() : void 0) || newValue.value;\n              } else {\n                return element.selectedIndex = valueIndexOf(options, newValue);\n              }\n            } else {\n              return element.value = newValue;\n            }\n          };\n          return bindObservable(element, value, context, update);\n        default:\n          element.oninput = element.onchange = function() {\n            return value(element.value);\n          };\n          if (typeof element.attachEvent === \"function\") {\n            element.attachEvent(\"onkeydown\", function() {\n              return setTimeout(function() {\n                return value(element.value);\n              }, 0);\n            });\n          }\n          return bindObservable(element, value, context, function(newValue) {\n            if (element.value !== newValue) {\n              return element.value = newValue;\n            }\n          });\n      }\n    });\n  };\n\n  specialBindings = {\n    INPUT: {\n      checked: function(element, value, context) {\n        element.onchange = function() {\n          return typeof value === \"function\" ? value(element.checked) : void 0;\n        };\n        return bindObservable(element, value, context, function(newValue) {\n          return element.checked = newValue;\n        });\n      }\n    },\n    SELECT: {\n      options: function(element, values, context) {\n        var updateValues;\n        values = Observable(values, context);\n        updateValues = function(values) {\n          empty(element);\n          element._options = values;\n          return values.map(function(value, index) {\n            var option, optionName, optionValue;\n            option = createElement(\"option\");\n            option._value = value;\n            if (typeof value === \"object\") {\n              optionValue = (value != null ? value.value : void 0) || index;\n            } else {\n              optionValue = value.toString();\n            }\n            bindObservable(option, optionValue, value, function(newValue) {\n              return option.value = newValue;\n            });\n            optionName = (value != null ? value.name : void 0) || value;\n            bindObservable(option, optionName, value, function(newValue) {\n              return option.textContent = option.innerText = newValue;\n            });\n            element.appendChild(option);\n            if (value === element._value) {\n              element.selectedIndex = index;\n            }\n            return option;\n          });\n        };\n        return bindObservable(element, values, context, updateValues);\n      }\n    }\n  };\n\n  observeAttribute = function(element, context, name, value) {\n    var binding, nodeName, _ref;\n    nodeName = element.nodeName;\n    if (name === \"value\") {\n      valueBind(element, value);\n    } else if (binding = (_ref = specialBindings[nodeName]) != null ? _ref[name] : void 0) {\n      binding(element, value, context);\n    } else if (name.match(/^on/) && isEvent(name.substr(2))) {\n      bindEvent(element, name, value, context);\n    } else if (isEvent(name)) {\n      bindEvent(element, \"on\" + name, value, context);\n    } else {\n      bindObservable(element, value, context, function(newValue) {\n        if ((newValue != null) && newValue !== false) {\n          return element.setAttribute(name, newValue);\n        } else {\n          return element.removeAttribute(name);\n        }\n      });\n    }\n    return element;\n  };\n\n  observeAttributes = function(element, context, attributes) {\n    return Object.keys(attributes).forEach(function(name) {\n      var value;\n      value = attributes[name];\n      return observeAttribute(element, context, name, value);\n    });\n  };\n\n  bindObservable = function(element, value, context, update) {\n    var observable, observe, unobserve;\n    observable = Observable(value, context);\n    observe = function() {\n      observable.observe(update);\n      return update(observable());\n    };\n    unobserve = function() {\n      return observable.stopObserving(update);\n    };\n    observe();\n    return element;\n  };\n\n  bindEvent = function(element, name, fn, context) {\n    return element[name] = function() {\n      return fn.apply(context, arguments);\n    };\n  };\n\n  id = function(element, context, sources) {\n    var lastId, update, value;\n    value = Observable.concat.apply(Observable, sources.map(function(source) {\n      return Observable(source, context);\n    }));\n    update = function(newId) {\n      return element.id = newId;\n    };\n    lastId = function() {\n      return value.last();\n    };\n    return bindObservable(element, lastId, context, update);\n  };\n\n  classes = function(element, context, sources) {\n    var classNames, update, value;\n    value = Observable.concat.apply(Observable, sources.map(function(source) {\n      return Observable(source, context);\n    }));\n    update = function(classNames) {\n      return element.className = classNames;\n    };\n    classNames = function() {\n      return value.join(\" \");\n    };\n    return bindObservable(element, classNames, context, update);\n  };\n\n  createElement = function(name) {\n    return document.createElement(name);\n  };\n\n  observeContent = function(element, context, contentFn) {\n    var append, contents, update;\n    contents = [];\n    contentFn.call(context, {\n      buffer: bufferTo(context, contents),\n      element: makeElement\n    });\n    append = function(item) {\n      if (item == null) {\n\n      } else if (typeof item === \"string\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item === \"number\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item === \"boolean\") {\n        return element.appendChild(document.createTextNode(item));\n      } else if (typeof item.each === \"function\") {\n        return item.each(append);\n      } else if (typeof item.forEach === \"function\") {\n        return item.forEach(append);\n      } else {\n        return element.appendChild(item);\n      }\n    };\n    update = function(contents) {\n      empty(element);\n      return contents.forEach(append);\n    };\n    return update(contents);\n  };\n\n  bufferTo = function(context, collection) {\n    return function(content) {\n      if (typeof content === 'function') {\n        content = Observable(content, context);\n      }\n      collection.push(content);\n      return content;\n    };\n  };\n\n  makeElement = function(name, context, attributes, fn) {\n    var element;\n    if (attributes == null) {\n      attributes = {};\n    }\n    element = createElement(name);\n    Observable(function() {\n      if (attributes.id != null) {\n        id(element, context, attributes.id);\n        return delete attributes.id;\n      }\n    });\n    Observable(function() {\n      if (attributes[\"class\"] != null) {\n        classes(element, context, attributes[\"class\"]);\n        return delete attributes[\"class\"];\n      }\n    });\n    Observable(function() {\n      return observeAttributes(element, context, attributes);\n    }, context);\n    if (element.nodeName !== \"SELECT\") {\n      Observable(function() {\n        return observeContent(element, context, fn);\n      }, context);\n    }\n    return element;\n  };\n\n  Runtime = function(context) {\n    var self;\n    self = {\n      buffer: function(content) {\n        if (self.root) {\n          throw \"Cannot have multiple root elements\";\n        }\n        return self.root = content;\n      },\n      element: makeElement,\n      filter: function(name, content) {}\n    };\n    return self;\n  };\n\n  Runtime.VERSION = require(\"../package.json\").version;\n\n  Runtime.Observable = Observable;\n\n  module.exports = Runtime;\n\n  empty = function(node) {\n    var child, _results;\n    _results = [];\n    while (child = node.firstChild) {\n      _results.push(node.removeChild(child));\n    }\n    return _results;\n  };\n\n  valueIndexOf = function(options, value) {\n    if (typeof value === \"object\") {\n      return options.indexOf(value);\n    } else {\n      return options.map(function(option) {\n        return option.toString();\n      }).indexOf(value.toString());\n    }\n  };\n\n  get = function(x) {\n    if (typeof x === 'function') {\n      return x();\n    } else {\n      return x;\n    }\n  };\n\n}).call(this);\n\n},{\"../package.json\":3,\"o_0\":2}],2:[function(require,module,exports){\n(function (global){\n// Generated by CoffeeScript 1.8.0\n(function() {\n  var Observable, PROXY_LENGTH, computeDependencies, copy, extend, flatten, get, last, magicDependency, remove, splat, tryCallWithFinallyPop,\n    __slice = [].slice;\n\n  module.exports = Observable = function(value, context) {\n    var changed, fn, listeners, notify, notifyReturning, self;\n    if (typeof (value != null ? value.observe : void 0) === \"function\") {\n      return value;\n    }\n    listeners = [];\n    notify = function(newValue) {\n      return copy(listeners).forEach(function(listener) {\n        return listener(newValue);\n      });\n    };\n    if (typeof value === 'function') {\n      fn = value;\n      self = function() {\n        magicDependency(self);\n        return value;\n      };\n      changed = function() {\n        value = computeDependencies(self, fn, changed, context);\n        return notify(value);\n      };\n      changed();\n    } else {\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        } else {\n          magicDependency(self);\n        }\n        return value;\n      };\n    }\n    self.each = function(callback) {\n      magicDependency(self);\n      if (value != null) {\n        [value].forEach(function(item) {\n          return callback.call(item, item);\n        });\n      }\n      return self;\n    };\n    if (Array.isArray(value)) {\n      [\"concat\", \"every\", \"filter\", \"forEach\", \"indexOf\", \"join\", \"lastIndexOf\", \"map\", \"reduce\", \"reduceRight\", \"slice\", \"some\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          magicDependency(self);\n          return value[method].apply(value, args);\n        };\n      });\n      [\"pop\", \"push\", \"reverse\", \"shift\", \"splice\", \"sort\", \"unshift\"].forEach(function(method) {\n        return self[method] = function() {\n          var args;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return notifyReturning(value[method].apply(value, args));\n        };\n      });\n      if (PROXY_LENGTH) {\n        Object.defineProperty(self, 'length', {\n          get: function() {\n            magicDependency(self);\n            return value.length;\n          },\n          set: function(length) {\n            value.length = length;\n            return notifyReturning(value.length);\n          }\n        });\n      }\n      notifyReturning = function(returnValue) {\n        notify(value);\n        return returnValue;\n      };\n      extend(self, {\n        each: function(callback) {\n          self.forEach(function(item, index) {\n            return callback.call(item, item, index, self);\n          });\n          return self;\n        },\n        remove: function(object) {\n          var index;\n          index = value.indexOf(object);\n          if (index >= 0) {\n            return notifyReturning(value.splice(index, 1)[0]);\n          }\n        },\n        get: function(index) {\n          magicDependency(self);\n          return value[index];\n        },\n        first: function() {\n          magicDependency(self);\n          return value[0];\n        },\n        last: function() {\n          magicDependency(self);\n          return value[value.length - 1];\n        },\n        size: function() {\n          magicDependency(self);\n          return value.length;\n        }\n      });\n    }\n    extend(self, {\n      listeners: listeners,\n      observe: function(listener) {\n        return listeners.push(listener);\n      },\n      stopObserving: function(fn) {\n        return remove(listeners, fn);\n      },\n      toggle: function() {\n        return self(!value);\n      },\n      increment: function(n) {\n        return self(value + n);\n      },\n      decrement: function(n) {\n        return self(value - n);\n      },\n      toString: function() {\n        return \"Observable(\" + value + \")\";\n      }\n    });\n    return self;\n  };\n\n  Observable.concat = function() {\n    var arg, args, collection, i, o, _i, _len;\n    args = new Array(arguments.length);\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      arg = arguments[i];\n      args[i] = arguments[i];\n    }\n    collection = Observable(args);\n    o = Observable(function() {\n      return flatten(collection.map(splat));\n    });\n    o.push = collection.push;\n    return o;\n  };\n\n  extend = function(target) {\n    var i, name, source, _i, _len;\n    for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {\n      source = arguments[i];\n      if (i > 0) {\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n    }\n    return target;\n  };\n\n  global.OBSERVABLE_ROOT_HACK = [];\n\n  magicDependency = function(self) {\n    var observerSet;\n    observerSet = last(global.OBSERVABLE_ROOT_HACK);\n    if (observerSet) {\n      return observerSet.add(self);\n    }\n  };\n\n  tryCallWithFinallyPop = function(fn, context) {\n    try {\n      return fn.call(context);\n    } finally {\n      global.OBSERVABLE_ROOT_HACK.pop();\n    }\n  };\n\n  computeDependencies = function(self, fn, update, context) {\n    var deps, value, _ref;\n    deps = new Set;\n    global.OBSERVABLE_ROOT_HACK.push(deps);\n    value = tryCallWithFinallyPop(fn, context);\n    if ((_ref = self._deps) != null) {\n      _ref.forEach(function(observable) {\n        return observable.stopObserving(update);\n      });\n    }\n    self._deps = deps;\n    deps.forEach(function(observable) {\n      return observable.observe(update);\n    });\n    return value;\n  };\n\n  try {\n    Object.defineProperty((function() {}), 'length', {\n      get: function() {},\n      set: function() {}\n    });\n    PROXY_LENGTH = true;\n  } catch (_error) {\n    PROXY_LENGTH = false;\n  }\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n  copy = function(array) {\n    return array.concat([]);\n  };\n\n  get = function(arg) {\n    if (typeof arg === \"function\") {\n      return arg();\n    } else {\n      return arg;\n    }\n  };\n\n  splat = function(item) {\n    var result, results;\n    results = [];\n    if (item == null) {\n      return results;\n    }\n    if (typeof item.forEach === \"function\") {\n      item.forEach(function(i) {\n        return results.push(i);\n      });\n    } else {\n      result = get(item);\n      if (result != null) {\n        results.push(result);\n      }\n    }\n    return results;\n  };\n\n  last = function(array) {\n    return array[array.length - 1];\n  };\n\n  flatten = function(array) {\n    return array.reduce(function(a, b) {\n      return a.concat(b);\n    }, []);\n  };\n\n}).call(this);\n\n}).call(this,typeof global !== \"undefined\" ? global : typeof self !== \"undefined\" ? self : typeof window !== \"undefined\" ? window : {})\n},{}],3:[function(require,module,exports){\nmodule.exports={\n  \"name\": \"hamlet.coffee\",\n  \"version\": \"0.7.6\",\n  \"description\": \"Truly amazing templating!\",\n  \"devDependencies\": {\n    \"browserify\": \"^12.0.1\",\n    \"coffee-script\": \"~1.7.1\",\n    \"jsdom\": \"^7.2.0\",\n    \"mocha\": \"^2.3.3\"\n  },\n  \"dependencies\": {\n    \"hamlet-compiler\": \"0.7.0\",\n    \"o_0\": \"0.3.8\"\n  },\n  \"homepage\": \"hamlet.coffee\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/dr-coffee-labs/hamlet.git\"\n  },\n  \"scripts\": {\n    \"prepublish\": \"script/prepublish\",\n    \"test\": \"script/test\"\n  },\n  \"files\": [\n    \"dist/\"\n  ],\n  \"main\": \"dist/runtime.js\"\n}\n\n},{}]},{},[1])(1)\n});",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ace.js",
    "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ext-language_tools.js",
    "https://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/coffee-console",
    "homepage": null,
    "description": "An embeddable CoffeeScript console",
    "html_url": "https://github.com/STRd6/coffee-console",
    "url": "https://api.github.com/repos/STRd6/coffee-console",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "postmaster": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "postmaster\n==========\n\nSend and receive `postMessage` commands using promises to handle the results.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "###\n\nPostmaster wraps the `postMessage` API with promises.\n\n###\n\ndefaultReceiver = self\nackTimeout = 1000\n\nmodule.exports = Postmaster = (self={}) ->\n  send = (data) ->\n    target = self.remoteTarget()\n    if !Worker? or target instanceof Worker\n      target.postMessage data\n    else\n      target.postMessage data, \"*\"\n\n  dominant = Postmaster.dominant()\n  self.remoteTarget ?= -> dominant\n  self.receiver ?= -> defaultReceiver\n  self.ackTimeout ?= -> ackTimeout\n\n  self.receiver().addEventListener \"message\", (event) ->\n    # Only listening to messages from `opener`\n    if event.source is self.remoteTarget() or !event.source\n      data = event.data\n      {type, method, params, id} = data\n\n      switch type\n        when \"ack\"\n          pendingResponses[id]?.ack = true\n        when \"response\"\n          pendingResponses[id].resolve data.result\n        when \"error\"\n          pendingResponses[id].reject data.error\n        when \"message\"\n          send\n            type: \"ack\"\n            id: id\n\n          Promise.resolve()\n          .then ->\n            if typeof self[method] is \"function\"\n              self[method](params...)\n            else\n              throw new Error \"`#{method}` is not a function\"\n          .then (result) ->\n            send\n              type: \"response\"\n              id: id\n              result: result\n          .catch (error) ->\n            if typeof error is \"string\"\n              message = error\n            else\n              message = error.message\n\n            send\n              type: \"error\"\n              id: id\n              error:\n                message: message\n                stack: error.stack\n\n  pendingResponses = {}\n  remoteId = 0\n\n  self.invokeRemote = (method, params...) ->\n    id = remoteId++\n\n    send\n      type: \"message\"\n      method: method\n      params: params\n      id: id\n\n    new Promise (resolve, reject) ->\n      clear = ->\n        clearTimeout pendingResponses[id].timeout\n        delete pendingResponses[id]\n\n      ackWait = self.ackTimeout()\n      timeout = setTimeout ->\n        pendingResponse = pendingResponses[id]\n        if pendingResponse and !pendingResponse.ack\n          clear()\n          reject new Error \"No ack received within #{ackWait}\"\n      , ackWait\n\n      pendingResponses[id] =\n        timeout: timeout\n        resolve: (result) ->\n          clear()\n          resolve(result)\n        reject: (error) ->\n          clear()\n          reject(error)\n\n  return self\n\nPostmaster.dominant = ->\n  if window? # iframe or child window context\n    opener or ((parent != window) and parent) or undefined\n  else # Web Worker Context\n    self\n\nreturn Postmaster\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.5.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/postmaster.coffee": {
          "path": "test/postmaster.coffee",
          "content": "Postmaster = require \"../main\"\n\nscriptContent = ->\n  fn = ->\n    pm = Postmaster()\n    pm.echo = (value) ->\n      return value\n    pm.throws = ->\n      throw new Error(\"This always throws\")\n    pm.promiseFail = ->\n      Promise.reject new Error \"This is a failed promise\"\n\n  \"\"\"\n    var module = {};\n    Postmaster = #{PACKAGE.distribution.main.content};\n    (#{fn.toString()})();\n  \"\"\"\n\ninitWindow = (targetWindow) ->\n  targetWindow.document.write \"<script>#{scriptContent()}<\\/script>\"\n\ndescribe \"Postmaster\", ->\n  it \"should work with openened windows\", (done) ->\n    childWindow = open(\"\", null, \"width=200,height=200\")\n\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .then (result) ->\n      assert.equal result, 5\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      childWindow.close()\n\n  it \"should work with iframes\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n  it \"should handle the remote call throwing errors\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"throws\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n  it \"should throwing a useful error when the remote doesn't define the function\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"someUndefinedFunction\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n  it \"should handle the remote call returning failed promises\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"promiseFail\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n  it \"should be able to go around the world\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.yolo = (txt) ->\n      \"heyy #{txt}\"\n    postmaster.invokeRemote \"invokeRemote\", \"yolo\", \"cool\"\n    .then (result) ->\n      assert.equal result, \"heyy cool\"\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n  it \"should work with web workers\", (done) ->\n    blob = new Blob [scriptContent()]\n    jsUrl = URL.createObjectURL(blob)\n\n    worker = new Worker(jsUrl)\n\n    base =\n      remoteTarget: -> worker\n      receiver: -> worker\n\n    postmaster = Postmaster(base)\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      worker.terminate()\n\n  it \"should fail quickly when contacting a window that doesn't support Postmaster\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .catch (e) ->\n      if e.message.match /no ack/i\n        done()\n      else\n        done(1)\n    .then ->\n      iframe.remove()\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "\n/*\n\nPostmaster wraps the `postMessage` API with promises.\n */\n\n(function() {\n  var Postmaster, ackTimeout, defaultReceiver,\n    __slice = [].slice;\n\n  defaultReceiver = self;\n\n  ackTimeout = 1000;\n\n  module.exports = Postmaster = function(self) {\n    var dominant, pendingResponses, remoteId, send;\n    if (self == null) {\n      self = {};\n    }\n    send = function(data) {\n      var target;\n      target = self.remoteTarget();\n      if ((typeof Worker === \"undefined\" || Worker === null) || target instanceof Worker) {\n        return target.postMessage(data);\n      } else {\n        return target.postMessage(data, \"*\");\n      }\n    };\n    dominant = Postmaster.dominant();\n    if (self.remoteTarget == null) {\n      self.remoteTarget = function() {\n        return dominant;\n      };\n    }\n    if (self.receiver == null) {\n      self.receiver = function() {\n        return defaultReceiver;\n      };\n    }\n    if (self.ackTimeout == null) {\n      self.ackTimeout = function() {\n        return ackTimeout;\n      };\n    }\n    self.receiver().addEventListener(\"message\", function(event) {\n      var data, id, method, params, type, _ref;\n      if (event.source === self.remoteTarget() || !event.source) {\n        data = event.data;\n        type = data.type, method = data.method, params = data.params, id = data.id;\n        switch (type) {\n          case \"ack\":\n            return (_ref = pendingResponses[id]) != null ? _ref.ack = true : void 0;\n          case \"response\":\n            return pendingResponses[id].resolve(data.result);\n          case \"error\":\n            return pendingResponses[id].reject(data.error);\n          case \"message\":\n            send({\n              type: \"ack\",\n              id: id\n            });\n            return Promise.resolve().then(function() {\n              if (typeof self[method] === \"function\") {\n                return self[method].apply(self, params);\n              } else {\n                throw new Error(\"`\" + method + \"` is not a function\");\n              }\n            }).then(function(result) {\n              return send({\n                type: \"response\",\n                id: id,\n                result: result\n              });\n            })[\"catch\"](function(error) {\n              var message;\n              if (typeof error === \"string\") {\n                message = error;\n              } else {\n                message = error.message;\n              }\n              return send({\n                type: \"error\",\n                id: id,\n                error: {\n                  message: message,\n                  stack: error.stack\n                }\n              });\n            });\n        }\n      }\n    });\n    pendingResponses = {};\n    remoteId = 0;\n    self.invokeRemote = function() {\n      var id, method, params;\n      method = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      id = remoteId++;\n      send({\n        type: \"message\",\n        method: method,\n        params: params,\n        id: id\n      });\n      return new Promise(function(resolve, reject) {\n        var ackWait, clear, timeout;\n        clear = function() {\n          clearTimeout(pendingResponses[id].timeout);\n          return delete pendingResponses[id];\n        };\n        ackWait = self.ackTimeout();\n        timeout = setTimeout(function() {\n          var pendingResponse;\n          pendingResponse = pendingResponses[id];\n          if (pendingResponse && !pendingResponse.ack) {\n            clear();\n            return reject(new Error(\"No ack received within \" + ackWait));\n          }\n        }, ackWait);\n        return pendingResponses[id] = {\n          timeout: timeout,\n          resolve: function(result) {\n            clear();\n            return resolve(result);\n          },\n          reject: function(error) {\n            clear();\n            return reject(error);\n          }\n        };\n      });\n    };\n    return self;\n  };\n\n  Postmaster.dominant = function() {\n    if (typeof window !== \"undefined\" && window !== null) {\n      return opener || ((parent !== window) && parent) || void 0;\n    } else {\n      return self;\n    }\n  };\n\n  return Postmaster;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.5.0\"};",
          "type": "blob"
        },
        "test/postmaster": {
          "path": "test/postmaster",
          "content": "(function() {\n  var Postmaster, initWindow, scriptContent;\n\n  Postmaster = require(\"../main\");\n\n  scriptContent = function() {\n    var fn;\n    fn = function() {\n      var pm;\n      pm = Postmaster();\n      pm.echo = function(value) {\n        return value;\n      };\n      pm.throws = function() {\n        throw new Error(\"This always throws\");\n      };\n      return pm.promiseFail = function() {\n        return Promise.reject(new Error(\"This is a failed promise\"));\n      };\n    };\n    return \"var module = {};\\nPostmaster = \" + PACKAGE.distribution.main.content + \";\\n(\" + (fn.toString()) + \")();\";\n  };\n\n  initWindow = function(targetWindow) {\n    return targetWindow.document.write(\"<script>\" + (scriptContent()) + \"<\\/script>\");\n  };\n\n  describe(\"Postmaster\", function() {\n    it(\"should work with openened windows\", function(done) {\n      var childWindow, postmaster;\n      childWindow = open(\"\", null, \"width=200,height=200\");\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 5).then(function(result) {\n        return assert.equal(result, 5);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return childWindow.close();\n      });\n    });\n    it(\"should work with iframes\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call throwing errors\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"throws\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should throwing a useful error when the remote doesn't define the function\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"someUndefinedFunction\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call returning failed promises\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"promiseFail\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should be able to go around the world\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.yolo = function(txt) {\n        return \"heyy \" + txt;\n      };\n      return postmaster.invokeRemote(\"invokeRemote\", \"yolo\", \"cool\").then(function(result) {\n        return assert.equal(result, \"heyy cool\");\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should work with web workers\", function(done) {\n      var base, blob, jsUrl, postmaster, worker;\n      blob = new Blob([scriptContent()]);\n      jsUrl = URL.createObjectURL(blob);\n      worker = new Worker(jsUrl);\n      base = {\n        remoteTarget: function() {\n          return worker;\n        },\n        receiver: function() {\n          return worker;\n        }\n      };\n      postmaster = Postmaster(base);\n      return postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return worker.terminate();\n      });\n    });\n    return it(\"should fail quickly when contacting a window that doesn't support Postmaster\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 5)[\"catch\"](function(e) {\n        if (e.message.match(/no ack/i)) {\n          return done();\n        } else {\n          return done(1);\n        }\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "version": "0.5.0",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.5.0",
        "default_branch": "master",
        "full_name": "distri/postmaster",
        "homepage": null,
        "description": "Send and receive postMessage commands.",
        "html_url": "https://github.com/distri/postmaster",
        "url": "https://api.github.com/repos/distri/postmaster",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});