var main=function() {

  var canvas=document.getElementById("your_canvas");
//   canvas.width=window.innerWidth;
//   canvas.height=window.innerHeight;

  /*========================= GET WEBGL CONTEXT ========================= */
  var gl;
  try {
    gl = canvas.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }
  // alert ("gl.SAMPLES == " + gl.getParameter(gl.SAMPLES));

  /*========================= SHADERS ========================= */
  /*jshint multistr: true */
  var shader_vertex_source="\n\
attribute vec2 position;\n\
varying vec2 vPos;\n\
\n\
void main(void) {\n\
gl_Position = vec4(position, 0., 1.);\n\
vPos = position;\n\
}";

  var shader_fragment_source_1="\n\
precision mediump float;\n\
uniform float time;\n\
varying vec2 vPos;\n\
const vec3 red=vec3(1,0,0);\n\
const vec3 blue=vec3(0,0,1);\n\
const vec3 yellow=vec3(1,1,0);\n\
const vec3 white=vec3(1,1,1);\n\
\n\
void main(void) {\n\
gl_FragColor = vec4(mix(mix(blue,yellow,vPos.x),mix(white,red,vPos.x),mod(vPos.y+time,1.0)),1);\n\
}";

  var shader_fragment_source="\n\
precision mediump float;\n\
uniform float time;\n\
varying vec2 vPos;\n\
void main(void) {\n\
  float c = cos(time), s = sin(time);\n\
  vec2 w = vec2 (vPos.x * c - vPos.y * s, vPos.x * s + vPos.y * c);\n\
  // bool b = w.x > 0.0;\n\
  // bool b = length(vPos) < 0.5;\n\
  bool b = length(vPos) < 0.5 ^^ w.x > 0.0;\n\
  float q = b?1.0:0.0;\n\
  gl_FragColor = vec4(q,q,q,1);\n\
}";

  var shader_fragment_source_a10="\n\
precision mediump float;\n\
uniform float time;\n\
varying vec2 vPos;\n\
void main () {\n\
    float a = 1.0;\n\
    float b = time;\n\
    float c = sin(b);\n\
    float d = 1.0 / c;\n\
    float e = cos(b);\n\
    vec2  g = vPos;\n\
    float k = d * dot(vec2(e,c),g);\n\
    float s = d * dot(vec2(e,- c),g.yx);\n\
    gl_FragColor = vec4(a - k + s * (k + (-1.0 + k)),s * k,k,a);\n\
}";

  var get_shader=function(source, type, typeString) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("ERROR IN "+typeString+ " SHADER :\n" + gl.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };

  var shader_vertex=get_shader(shader_vertex_source, gl.VERTEX_SHADER, "VERTEX");
  var shader_fragment=get_shader(shader_fragment_source_a10, gl.FRAGMENT_SHADER, "FRAGMENT");

  var SHADER_PROGRAM=gl.createProgram();

  gl.attachShader(SHADER_PROGRAM, shader_vertex);
  gl.attachShader(SHADER_PROGRAM, shader_fragment);

  gl.linkProgram(SHADER_PROGRAM);

  var _position = gl.getAttribLocation(SHADER_PROGRAM, "position");
  var _time = gl.getUniformLocation(SHADER_PROGRAM, "time");
  // alert("_time == " + _time);

  gl.enableVertexAttribArray(_position);

  gl.useProgram(SHADER_PROGRAM);
  gl.uniform1f(_time, 0.85);

  /*jshint laxcomma: true */

  /*========================= THE TRIANGLE ========================= */
  //POINTS :
  var triangle_vertex=[
    -1,-1, //first summit -> bottom left of the viewport
    1,-1, //bottom right of the viewport
    1,1  //top right of the viewport
    ,-1,1
  ];

  var TRIANGLE_VERTEX= gl.createBuffer ();
  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(triangle_vertex),
    gl.STATIC_DRAW);
  var triangle_faces = [0,1,2, 0,2,3];

  var TRIANGLE_FACES= gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces),
    gl.STATIC_DRAW);

//   gl.enable(gl.BLEND);
//   gl.blendEquation( gl.FUNC_SUBTRACT );
//   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//   // gl.disable(gl.DEPTH_TEST);

  /*========================= DRAWING ========================= */
  // gl.clearColor(0.0, 0.0, 0.0, 0.0);

  var redraw=function(t) {
      if (_time) {
          gl.uniform1f(_time, t/1000);
          queueDraw();
      }
      // gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
      gl.vertexAttribPointer(_position, 2, gl.FLOAT, false,4*2,0) ;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.flush();

  };
  var queueDraw=function() { window.requestAnimationFrame(redraw); }
  var resizeCanvas=function() {
      canvas.width=window.innerWidth;
      canvas.height=window.innerHeight;
      gl.viewport(0.0, 0.0, canvas.width, canvas.height);
      queueDraw();
  }
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
};
