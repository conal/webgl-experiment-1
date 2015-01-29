var main=function() {

  var CANVAS=document.getElementById("your_canvas");
//   CANVAS.width=window.innerWidth;
//   CANVAS.height=window.innerHeight;

  /*========================= GET WEBGL CONTEXT ========================= */
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: false});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }

  /*========================= SHADERS ========================= */
  /*jshint multistr: true */
  var shader_vertex_source="\n\
attribute vec2 position;\n\
varying vec2 vU;\n\
\n\
void main(void) {\n\
gl_Position = vec4(position, 0., 1.);\n\
vU = (position+1.0)/2.0;\n\
}";

  var shader_fragment_source="\n\
precision mediump float;\n\
const vec3 red=vec3(1,0,0);\n\
const vec3 blue=vec3(0,0,1);\n\
const vec3 yellow=vec3(1,1,0);\n\
const vec3 white=vec3(1,1,1);\n\
\n\
varying vec2 vU;\n\
void main(void) {\n\
gl_FragColor = vec4(mix(mix(blue,yellow,vU.x),mix(white,red,vU.x),vU.y),1);\n\
}";

  var get_shader=function(source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert("ERROR IN "+typeString+ " SHADER :\n" + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };

  var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

  var SHADER_PROGRAM=GL.createProgram();

  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);

  GL.linkProgram(SHADER_PROGRAM);

  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

  GL.enableVertexAttribArray(_position);

  GL.useProgram(SHADER_PROGRAM);

  /*jshint laxcomma: true */

  /*========================= THE TRIANGLE ========================= */
  //POINTS :
  var triangle_vertex=[
    -1,-1, //first summit -> bottom left of the viewport
    1,-1, //bottom right of the viewport
    1,1  //top right of the viewport
    ,-1,1
  ];

  var TRIANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(triangle_vertex),
    GL.STATIC_DRAW);
  var triangle_faces = [0,1,2, 0,2,3];

  var TRIANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces),
    GL.STATIC_DRAW);



  /*========================= DRAWING ========================= */
  GL.clearColor(0.0, 0.0, 0.0, 0.0);

  var redraw=function() {
    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    // GL.clear(GL.COLOR_BUFFER_BIT);

    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false,4*2,0) ;

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    GL.flush();
    // queueDraw();
  };
  var queueDraw=function() { window.requestAnimationFrame(redraw); }
  var resizeCanvas=function() {
      CANVAS.width=window.innerWidth;
      CANVAS.height=window.innerHeight;
      queueDraw();
  }
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
};
