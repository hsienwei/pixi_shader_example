"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PIXI = __importStar(require("pixi.js"));
var dat = __importStar(require("dat.gui"));
var grayscale = "\nprecision mediump float;\n\nvarying vec2 vTextureCoord;//The coordinates of the current pixel\nuniform sampler2D uSampler;//The image data\n\nvoid main(){\n   \n  vec4 color = texture2D(uSampler, vTextureCoord);\n  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));\n\tgl_FragColor = vec4(vec3(gray), color.a);\n}\n";
var uvAnimate = "\nprecision mediump float;\nvarying vec2 vTextureCoord;//The coordinates of the current pixel\nuniform sampler2D uSampler;//The image data\nuniform float gameTime;\n\nvoid main(){\n  vec2 tCoord = vTextureCoord;\n  tCoord.x = fract ( gameTime + tCoord.x * 5.0);\n  tCoord.y = fract ( gameTime + tCoord.y * 5.0);\n  gl_FragColor= texture2D(uSampler, tCoord);\n}\n";
// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786
var hue = "\nprecision mediump float;\nprecision mediump int;\n\nconst vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);\nconst vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);\nconst vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);\n\nconst vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);\nconst vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);\nconst vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float hue;\n\nvoid main ()\n{\n    // Sample the input pixel\n\t vec4 color = texture2D(uSampler, vTextureCoord).rgba;\n\n    // Convert to YIQ\n    float   YPrime  = dot (color, kRGBToYPrime);\n    float   I      = dot (color, kRGBToI);\n    float   Q      = dot (color, kRGBToQ);\n\n    // Calculate the chroma\n    float   chroma  = sqrt (I * I + Q * Q);\n\n    // Convert desired hue back to YIQ\n    Q = chroma * sin (hue);\n    I = chroma * cos (hue);\n\n    // Convert back to RGB\n    vec4    yIQ   = vec4 (YPrime, I, Q, 0.0);\n    color.r = dot (yIQ, kYIQToR);\n    color.g = dot (yIQ, kYIQToG);\n    color.b = dot (yIQ, kYIQToB);\n\n    // Save the result\n    gl_FragColor    = color;\n}";
// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786
var hue2 = "\nprecision mediump float;\nprecision mediump int;\n\nconst vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);\nconst vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);\nconst vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);\n\nconst vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);\nconst vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);\nconst vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float hueAdjust;\n\nvoid main ()\n{\n    // Sample the input pixel\n\t vec4 color = texture2D(uSampler, vTextureCoord).rgba;\n\n    float   YPrime  = dot (color, kRGBToYPrime);\n    float   I      = dot (color, kRGBToI);\n    float   Q      = dot (color, kRGBToQ);\n    float   hue     = atan (Q, I);\n    float   chroma  = sqrt (I * I + Q * Q);\n\n    hue += hueAdjust;\n\n    Q = chroma * sin (hue);\n    I = chroma * cos (hue);\n\n    vec4 yIQ   = vec4 (YPrime, I, Q, 0.0);\n    gl_FragColor = vec4( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) , color.a);\n}";
var foamyWater = "\n// https://www.shadertoy.com/view/llcXW7\n// Made by k-mouse (2016-11-23)\n// Modified from David Hoskins (2013-07-07) and joltz0r (2013-07-04)\n\nprecision mediump float;\nprecision mediump int;\n\n#define TAU 6.28318530718\n\n#define TILING_FACTOR 1.0\n#define MAX_ITER 8\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float gameTime;\n\n\nfloat waterHighlight(vec2 p, float time, float foaminess)\n{\n    vec2 i = vec2(p);\n\tfloat c = 0.0;\n    float foaminess_factor = mix(1.0, 6.0, foaminess);\n\tfloat inten = .005 * foaminess_factor;\n\n\tfor (int n = 0; n < MAX_ITER; n++) \n\t{\n\t\tfloat t = time * (1.0 - (3.5 / float(n+1)));\n\t\ti = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\n\t\tc += 1.0/length(vec2(p.x / (sin(i.x+t)),p.y / (cos(i.y+t))));\n\t}\n\tc = 0.2 + c / (inten * float(MAX_ITER));\n\tc = 1.17-pow(c, 1.4);\n    c = pow(abs(c), 8.0);\n\treturn c / sqrt(foaminess_factor);\n}\n\n\nvoid main() \n{\n\tfloat time = gameTime * 0.1+23.0;\n\tvec2 uv = vTextureCoord;\n\tvec2 uv_square = vec2(uv.x * 800.0/ 600.0, uv.y);\n    float dist_center = pow(2.0*length(uv - 0.5), 2.0);\n    \n    float foaminess = smoothstep(0.4, 1.8, dist_center);\n    float clearness = 0.1 + 0.9*smoothstep(0.1, 0.5, dist_center);\n    \n\tvec2 p = mod(uv_square*TAU*TILING_FACTOR, TAU)-250.0;\n    \n    float c = waterHighlight(p, time, foaminess);\n    \n    vec3 water_color = vec3(0.0, 0.35, 0.5);\n\tvec3 color = vec3(c);\n   color = clamp(color + water_color, 0.0, 1.0);\n    \n    color = mix(water_color, color, clearness);\n\n  gl_FragColor = vec4(color, 1.0);\n  \n}\n";
// https://www.shadertoy.com/view/MtcXD4
var eightBitFrag = "\n\n#define zoom 2.0\n#define width (8.0 * zoom)\n#define height (8.0 * zoom)\n\nvarying vec2 vTextureCoord;\n//varying vec2 vTexturePos;\nuniform sampler2D uSampler;\nuniform float gameTime;\nuniform float texturePosX;\nuniform float texturePosY;\n\n\nvoid main( )\n{\n  vec2 vTexturePos = vec2(vTextureCoord.x * texturePosX, vTextureCoord.y * texturePosY);\n    vec4 total = vec4(0.0);\n    float offsetX = mod(vTexturePos.x, width);\n    float offsetY = mod(vTexturePos.y, height);\n    vec2 pos = vec2(vTexturePos.x - offsetX, vTexturePos.y - offsetY);\n    vec2 uvNew = vec2(0.0, 0.0);\n    for (float row = 0.0; row < height; row++) {\n        for (float col = 0.0; col < width; col++) {\n            uvNew = vec2((pos.x + col) / texturePosX, (pos.y + row) / texturePosY);\n            total = total + texture2D(uSampler, uvNew);\n        }\n    }\n\n    total = total / (width * height);\n\n    // Doing testing for ascii mapping\n    // float grey = total.x*75. + total.y*155. + total.z*25.;\n    // grey = grey / 255.;\n    \n    gl_FragColor = total;\n}\n";
var uniforms = {
    "gameTime": { "type": '1f', "value": 1 },
    "hue": { "type": '1f', "value": 1 },
    "hueAdjust": { "type": '1f', "value": 1 },
    "texturePosX": { "type": '1f', "value": 900 },
    "texturePosY": { "type": '1f', "value": 900 }
};
var gui = new dat.GUI();
var app = new PIXI.Application({
    width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);
var container = new PIXI.Container();
app.stage.addChild(container);
// Create a new texture
var texture = PIXI.Texture.from('Idle_000.png');
var bunny = new PIXI.Sprite(texture);
bunny.anchor.set(0.5);
bunny.x = app.screen.width / 2;
bunny.y = app.screen.height / 2;
bunny.scale.x = 0.5;
bunny.scale.y = 0.5;
//const b = new PIXI.Program( PIXI.Program.defaultVertexSrc, spawningEffect);
//bunny.filters= [b];
//bunny.shader = new PIXI.Shader(b, uniforms);
var f = new PIXI.Filter(PIXI.Program.defaultVertexSrc, hue2, uniforms);
bunny.filters = [f];
f.uniforms.gameTime = 0.2;
f.uniforms.hue = 1;
f.uniforms.hueAdjust = 1;
f.uniforms.texturePosX = 900;
f.uniforms.texturePosY = 900;
container.addChild(bunny);
var t = 0;
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
