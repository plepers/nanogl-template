
var fs = require( 'fs' );
const util = require('util');
var compiler = require('../lib/compiler');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);


async function compile( name ){
    var glsl = await readFile( `./test/${name}.glsl`, {encoding:'utf8'} )
    var res = compiler( glsl, {module:'cjs'} );
    await writeFile( `./test/${name}.glsl.js`, res );
    return res
}

async function run(){

    await compile( 'include1' );
    await compile( 'simple' );
    
    var fn = require( './simple.glsl.js' )
    var final = fn( {
        index:3,
        shadowIndex:2
    })
    
    await writeFile( './test/simple.gen.glsl', final );
}

run();