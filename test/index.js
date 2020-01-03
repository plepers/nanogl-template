
var fs = require( 'fs' );
const util = require('util');
var compiler = require('../lib/compiler');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);


async function run(){

    var simple = await readFile( './test/simple.glsl', {encoding:'utf8'} )
    var res = compiler( simple );
    console.log( res )
    writeFile( './test/simple.js', res );

}

run();