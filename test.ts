import * as PIXI from "pixi.js";

import * as dat from "dat.gui"

const grayscale = `
precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data

void main(){
   
  vec4 color = texture2D(uSampler, vTextureCoord);
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor = vec4(vec3(gray), color.a);
}
`;

const uvAnimate = `
precision mediump float;
varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float gameTime;

void main(){
  vec2 tCoord = vTextureCoord;
  tCoord.x = fract ( gameTime + tCoord.x * 5.0);
  tCoord.y = fract ( gameTime + tCoord.y * 5.0);
  gl_FragColor= texture2D(uSampler, tCoord);
}
`;

// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786
const hue = `
precision mediump float;
precision mediump int;

const vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);
const vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);
const vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);

const vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);
const vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);
const vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float hue;

void main ()
{
    // Sample the input pixel
	 vec4 color = texture2D(uSampler, vTextureCoord).rgba;

    // Convert to YIQ
    float   YPrime  = dot (color, kRGBToYPrime);
    float   I      = dot (color, kRGBToI);
    float   Q      = dot (color, kRGBToQ);

    // Calculate the chroma
    float   chroma  = sqrt (I * I + Q * Q);

    // Convert desired hue back to YIQ
    Q = chroma * sin (hue);
    I = chroma * cos (hue);

    // Convert back to RGB
    vec4    yIQ   = vec4 (YPrime, I, Q, 0.0);
    color.r = dot (yIQ, kYIQToR);
    color.g = dot (yIQ, kYIQToG);
    color.b = dot (yIQ, kYIQToB);

    // Save the result
    gl_FragColor    = color;
}`;


// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786
const hue2 = `
precision mediump float;
precision mediump int;

const vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);
const vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);
const vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);

const vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);
const vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);
const vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float hueAdjust;

void main ()
{
    // Sample the input pixel
	 vec4 color = texture2D(uSampler, vTextureCoord).rgba;

    float   YPrime  = dot (color, kRGBToYPrime);
    float   I      = dot (color, kRGBToI);
    float   Q      = dot (color, kRGBToQ);
    float   hue     = atan (Q, I);
    float   chroma  = sqrt (I * I + Q * Q);

    hue += hueAdjust;

    Q = chroma * sin (hue);
    I = chroma * cos (hue);

    vec4 yIQ   = vec4 (YPrime, I, Q, 0.0);
    gl_FragColor = vec4( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) , color.a);
}`;

const foamyWater  = `
// https://www.shadertoy.com/view/llcXW7
// Made by k-mouse (2016-11-23)
// Modified from David Hoskins (2013-07-07) and joltz0r (2013-07-04)

precision mediump float;
precision mediump int;

#define TAU 6.28318530718

#define TILING_FACTOR 1.0
#define MAX_ITER 8

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float gameTime;


float waterHighlight(vec2 p, float time, float foaminess)
{
    vec2 i = vec2(p);
	float c = 0.0;
    float foaminess_factor = mix(1.0, 6.0, foaminess);
	float inten = .005 * foaminess_factor;

	for (int n = 0; n < MAX_ITER; n++) 
	{
		float t = time * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)),p.y / (cos(i.y+t))));
	}
	c = 0.2 + c / (inten * float(MAX_ITER));
	c = 1.17-pow(c, 1.4);
    c = pow(abs(c), 8.0);
	return c / sqrt(foaminess_factor);
}


void main() 
{
	float time = gameTime * 0.1+23.0;
	vec2 uv = vTextureCoord;
	vec2 uv_square = vec2(uv.x * 800.0/ 600.0, uv.y);
    float dist_center = pow(2.0*length(uv - 0.5), 2.0);
    
    float foaminess = smoothstep(0.4, 1.8, dist_center);
    float clearness = 0.1 + 0.9*smoothstep(0.1, 0.5, dist_center);
    
	vec2 p = mod(uv_square*TAU*TILING_FACTOR, TAU)-250.0;
    
    float c = waterHighlight(p, time, foaminess);
    
    vec3 water_color = vec3(0.0, 0.35, 0.5);
	vec3 color = vec3(c);
   color = clamp(color + water_color, 0.0, 1.0);
    
    color = mix(water_color, color, clearness);

  gl_FragColor = vec4(color, 1.0);
  
}
`;


// https://www.shadertoy.com/view/MtcXD4
const eightBitFrag = `

#define zoom 2.0
#define width (8.0 * zoom)
#define height (8.0 * zoom)

varying vec2 vTextureCoord;
//varying vec2 vTexturePos;
uniform sampler2D uSampler;
uniform float gameTime;
uniform float texturePosX;
uniform float texturePosY;


void main( )
{
  vec2 vTexturePos = vec2(vTextureCoord.x * texturePosX, vTextureCoord.y * texturePosY);
    vec4 total = vec4(0.0);
    float offsetX = mod(vTexturePos.x, width);
    float offsetY = mod(vTexturePos.y, height);
    vec2 pos = vec2(vTexturePos.x - offsetX, vTexturePos.y - offsetY);
    vec2 uvNew = vec2(0.0, 0.0);
    for (float row = 0.0; row < height; row++) {
        for (float col = 0.0; col < width; col++) {
            uvNew = vec2((pos.x + col) / texturePosX, (pos.y + row) / texturePosY);
            total = total + texture2D(uSampler, uvNew);
        }
    }

    total = total / (width * height);

    // Doing testing for ascii mapping
    // float grey = total.x*75. + total.y*155. + total.z*25.;
    // grey = grey / 255.;
    
    gl_FragColor = total;
}
`;


var uniforms = 
{
  "gameTime": {"type": '1f',"value": 1},
  "hue": {"type": '1f',"value": 1},
  "hueAdjust": {"type": '1f',"value": 1},
  "texturePosX": {"type": '1f',"value": 900},
  "texturePosY": {"type": '1f',"value": 900}
};

const gui = new dat.GUI();

const app = new PIXI.Application({
  width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from('Idle_000.png');

const bunny = new PIXI.Sprite(texture);
bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;
bunny.scale.x = 0.5;
bunny.scale.y = 0.5;

//const b = new PIXI.Program( PIXI.Program.defaultVertexSrc, spawningEffect);

//bunny.filters= [b];

//bunny.shader = new PIXI.Shader(b, uniforms);
const f = new PIXI.Filter(PIXI.Program.defaultVertexSrc, hue2, uniforms);
bunny.filters = [f];
f.uniforms.gameTime = 0.2;
f.uniforms.hue = 1;
f.uniforms.hueAdjust = 1;
f.uniforms.texturePosX = 900;
  f.uniforms.texturePosY = 900;
container.addChild(bunny);

let t: number = 0;
console.log(f.uniforms);
gui.add(f.uniforms, 'hue', -5, 5);
gui.add(f.uniforms, 'hueAdjust', -20, 20);
gui.add(f, 'enabled');

/*app.ticker.add( ()=>{
  t += app.ticker.deltaMS;
  
  f.uniforms.gameTime = t * 0.001;
  f.uniforms.hue = t * 0.001;

  f.uniforms.texturePosX = 900;
  f.uniforms.texturePosY = 900;
  console.log(f.uniforms);
  
});*/
