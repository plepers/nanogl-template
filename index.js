var path    = require( 'path' ),
    through = require( 'through2' ),
    compiler= require( './lib/compiler' );

var MAGIC = '/*ngltpl*/'

var processTemplate = function(templateSource, callback, settings) 
{ 
  var magicIndex = templateSource.indexOf( MAGIC );
  if( magicIndex > -1 ) 
    this.push( templateSource );
  else
    this.push( MAGIC+compiler( templateSource, settings ) );

  callback.call(this);
};


function transform(file, settings) 
{

  var fileExtension = path.extname(file);

  if ( settings !== undefined && ( settings.extensions === undefined || settings.extensions.indexOf(fileExtension) === -1 ) ) {
    // File does not match the specified file extension
    return through();
    
  }

  var chunks = [];

  function parts(chunk, enc, callback) {
    chunks.push(chunk); callback();
  }

  return through(parts, function(callback) {
    try {
      processTemplate.call(this, chunks.join(''), function(template) {
        callback();
      }, settings);
    } catch( err ) {
      // Annotate error with the file in which it originated
      err.message = err.message + ' in ' + file;
      throw err;
    }
  });
}

module.exports = transform;
