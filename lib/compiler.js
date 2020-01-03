// Modified version of _ (Underscore)  templates
// (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors



// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
const templateSettings = {
  evaluate    : /\{\{=([\s\S]+?)\}\}/g,
  scoped      : /\{\{@([\s\S]+?)\}\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g,
  include     : /#include\s+["'<>]([^'"<>]+)["'<>]/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
const noMatch = /(.)^/;



// Certain characters need to be escaped so that they can be put into a
// string literal.
const escapes = {
  "`":      "`",
  '\\':     '\\',
  // '\r':     'r',
  // '\n':     'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

const escaper = /\\|`|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
};



// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
/**
 * 
 * @param {String} text 
 * @param {*} opts 
 */
function compile(text, opts = {} ) {
  settings = templateSettings;

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.scoped      || noMatch).source,
    (settings.evaluate    || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.include     || noMatch).source
  ].join('|') + '|$', 'g');


  var includes = {};
  var numIncludes = 0
  function _include( path ){
    if( includes[path] === undefined ){
      includes[path] = "INC_"+(numIncludes++)
    }
    return includes[path];
  }

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+=`";
  text.replace(matcher, function(match, scoped, evaluate, interpolate, include, offset) {
    source += text.slice(index, offset).replace(escaper, escapeChar);
    index = offset + match.length;

    if (scoped) {
      source += "${obj." + scoped + "}";
    } else if (evaluate) {
      source += "`;\n" + evaluate + "\n__p+=`";
    } else if (interpolate) {
      source += "${" + interpolate + "}";
    } else if( include ){
      source += "${ " + _include(include) + "() }";
    }

    // Adobe VMs need the match returned to produce the correct offest.
    return match;
  });
  source += "`;\n";

  // If a variable is not specified, place data values in local scope.

  source = "var __t,__p='';\n" + source + 'return __p;\n';


  var moduleStr = ''

  for (const key in includes) {
    const includeName = includes[key];
    moduleStr += `const ${includeName} = require('${key}');\n`
  }

  moduleStr += 'var fn = function( obj ){\n' + source + '};\nfn.toString=fn;\n';
  if( opts.module === 'esm' ){
    moduleStr += 'export default fn;'
  } else {
    moduleStr += 'module.exports = fn;'
  }

  return moduleStr;
}

module.exports = compile;