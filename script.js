function get_file_text(path) {
    var XHR = new XMLHttpRequest();
    XHR.open("GET", path, false);
    if (XHR.overrideMimeType) {
        XHR.overrideMimeType("text/plain");
    }
    try {
        XHR.send(null);
    } catch(e) {
        this.println('Error reading file "' + path + '"');
    }
    if (!XHR.responseText)
        throw ("get_file_text "+path+": file not found.");
    return XHR.responseText;
};

function get_ext(path) {
    var ext = path.split('.').pop();
    return (ext==path) ? '' : ext;
}

function load_shader(gl,path) {
    var ext = get_ext(path),
        content = get_file_text(path);
    switch (ext) {
    case "vert":
        return get_shader(gl,content, gl.VERTEX_SHADER, "VERTEX");
    case "frag":
        return get_shader(gl,content, gl.FRAGMENT_SHADER, "FRAGMENT");
    }
}

function get_shader(gl,source, type, typeString) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("ERROR IN "+typeString+ " SHADER :\n" + gl.getShaderInfoLog(shader));
        return false;
    }
    return shader;
};

function main() {
  var canvas=document.getElementById("your_canvas");

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

  var shader_vertex=load_shader(gl,"shaders/image.vert");
  var shader_fragment=load_shader(gl,"shaders/a10.frag");

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
          // queueDraw();
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
