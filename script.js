var frag = "a10"; // "diskHalfSpace" "checker"

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

var utils_glsl = get_file_text("shaders/utils.glsl") + "\n\n";

function get_extension(path) {
    var ext = path.split('.').pop();
    return (ext == path) ? '' : ext;
}

function load_shader(gl,path) {
    var ext = get_extension(path),
        content = get_file_text(path);
    switch (ext) {
    case "vert":
        return get_shader(gl,content, gl.VERTEX_SHADER, "vertex");
    case "frag":
        return get_shader(gl,utils_glsl + content, gl.FRAGMENT_SHADER, "fragment");
    }
}

function get_shader(gl,source, type, typeString) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("ERROR IN "+typeString+ " shader:\n" + gl.getShaderInfoLog(shader));
        return false;
    }
    return shader;
};

function main() {
  var canvas = document.getElementById("main_canvas");
  var gl;
  try {
      gl = canvas.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
      alert("You are not webgl compatible :(") ;
      return false;
  }
  // alert ("gl.SAMPLES == " + gl.getParameter(gl.SAMPLES));

  // Shaders
  var SHADER_PROGRAM = gl.createProgram();
  gl.attachShader(SHADER_PROGRAM, load_shader(gl,"shaders/image.vert"));
  gl.attachShader(SHADER_PROGRAM, load_shader(gl,"shaders/"+frag+".frag"));
  gl.linkProgram(SHADER_PROGRAM);
  // Attributes & uniforms
  var _position = gl.getAttribLocation(SHADER_PROGRAM, "position");
  var _time = gl.getUniformLocation(SHADER_PROGRAM, "time");
  // alert("_time == " + _time);
  var _magnify = gl.getUniformLocation(SHADER_PROGRAM, "magnify");

  gl.enableVertexAttribArray(_position);

  gl.useProgram(SHADER_PROGRAM);
  // gl.uniform1f(_time, 0.85);

  // Geometry
  var TRIANGLE_VERTEX =  gl.createBuffer ();
  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, 1,1, -1,1]),
                gl.STATIC_DRAW);
  var TRIANGLE_FACES =  gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2, 0,2,3]),
                gl.STATIC_DRAW);

  /*
  gl.enable(gl.BLEND);
  gl.blendEquation( gl.FUNC_SUBTRACT );
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  */
  // gl.clearColor(0.0, 0.0, 0.0, 0.0);

  var redraw = function(t) {
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
  var queueDraw = function() { window.requestAnimationFrame(redraw); }
  var resizeCanvas = function() {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      // gl.viewport(0.0, 0.0, canvas.width, canvas.height);
      var mi = Math.min(w,h), ma = Math.max(w,h);
      gl.viewport((w-ma)/2, (h-ma)/2, ma,ma);
      gl.uniform1f(_magnify, mi/ma);
      queueDraw();
  }
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
};
