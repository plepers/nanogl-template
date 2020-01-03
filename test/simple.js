const INC_0 = require('./includes/spherical-harmonics.glsl');
const INC_1 = require('./includes/spherical-harmonics2.glsl');
const INC_2 = require('./includes/spherical-harmonics3.glsl');
var fn = function( obj ){
var __t,__p='';
__p+=`// --------- SPEC
#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec4 uSHCoeffs[7];
  ${ INC_0() }
  ${ INC_1() }  
  ${ INC_2() }  

    // XXXXXXX

  ${ require( "./includes/spherical-harmonics.glsl" )() }
#endif


{



  vec3 H = normalize( uLDirDirections[${obj.index}] + viewDir );
  float NoH = sdot( H,worldNormal );
  float sContib = specularMul * pow( NoH, roughness );
  // -------- DIFFUSE
  float dContrib = (1.0/3.141592) * sdot( uLDirDirections[${obj.index}] ,worldNormal );

  `;
 if(obj.shadowIndex>-1){ 
__p+=`
  {
    vec3 fragCoord = calcShadowPosition( uShadowTexelBiasVector[${obj.shadowIndex}], uShadowMatrices[${obj.shadowIndex}] , vWorldPosition, worldNormal, uShadowMapSize[${obj.shadowIndex}].y );
    float shOccl = calcLightOcclusions(tShadowMap${obj.shadowIndex},fragCoord,uShadowMapSize[${obj.shadowIndex}]);
    dContrib *= shOccl;
    sContib  *= shOccl;
    
    #if iblShadowing
      float sDamp = uLDirColors[${obj.index}].a;
      specularColor *= mix( sDamp, 1.0, shOccl );
    #endif
  }
  `;
 } 
__p+=`

  diffuseCoef   += dContrib * uLDirColors[${obj.index}].rgb;
  LS_SPECULAR   += sContib  * uLDirColors[${obj.index}].rgb;

}`;
return __p;
};
fn.toString=fn;
module.exports = fn;