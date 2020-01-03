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


/**
 * 
 * @param {String} text 
 * @param {*} opts 
 */
function compile(text, opts = {} ) {

  settings = templateSettings;

  // Combine delimiters into one regular expression via alternation.
  const matcher = RegExp([
    (settings.scoped      || noMatch).source,
    (settings.evaluate    || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.include     || noMatch).source
  ].join('|') + '|$', 'g');


  let includes = {};
  let numIncludes = 0

  function _registerInclude( path ){
    if( includes[path] === undefined ){
      includes[path] = "_INCL_"+(numIncludes++)
    }
    return includes[path];
  }

  // Compile the template source, escaping string literals appropriately.
  let index = 0;
  let body = "__p+=`";
  text.replace(matcher, function(match, scoped, evaluate, interpolate, include, offset) {
    body += text.slice(index, offset).replace(escaper, escapeChar);
    index = offset + match.length;

    if (scoped) {
      body += "${obj." + scoped + "}";
    } else if (evaluate) {
      body += "`;\n" + evaluate + "\n__p+=`";
    } else if (interpolate) {
      body += "${" + interpolate + "}";
    } else if( include ){
      body += "${" + _registerInclude(include) + "()}";
    }

    return match;
  });
  body += "`;\n";


  
  
  let includeStr = ''
  
  for (const key in includes) {
    if( opts.module === 'esm' ){
      includeStr += `import ${includes[key]} from '${key}';\n`
    } else {
      includeStr += `const ${includes[key]} = require('${key}');\n`
    }
  }
  
  
  let exportStr = ''
  if( opts.module === 'esm' ){
    exportStr += 'export default fn;'
  } else {
    exportStr += 'module.exports = fn;'
  }


  const moduleStr = `
${includeStr}

function fn( obj )
{
  let __p = '';

  ${body}

  return __p;
}

fn.toString = fn;

${exportStr}
`;
  
  return moduleStr;
}

module.exports = compile;