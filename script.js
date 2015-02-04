function get_file_text(path) {
    var XHR = new XMLHttpRequest();
    XHR.open("GET", path, false);
    if (XHR.overrideMimeType) {
        XHR.overrideMimeType("text/plain");
    }
    try {
        XHR.send(null);
    } catch (e) {
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
    alert("load_shader: unknown extension "+ext);
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
  var canvas = document.getElementById("effect_canvas");
  var gl;
  try {
      gl = canvas.getContext("webgl", {antialias: true,alpha:false});
  } catch (e) {
      alert("You are not webgl compatible :(") ;
      return false;
  }
  // alert ("gl.SAMPLES == " + gl.getParameter(gl.SAMPLES));

  // Geometry
  var TRIANGLE_VERTEX =  gl.createBuffer ();
  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, 1,1, -1,1]),
                gl.STATIC_DRAW);
  var TRIANGLE_FACES =  gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2, 0,2,3]),
                gl.STATIC_DRAW);

  // I want to experiment with blending for cheap temporal and
  // spatial antialiasing.
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  /*
  gl.blendEquation( gl.FUNC_SUBTRACT );
  */
  gl.clearColor(1.0, 0.0, 0.0, 0.0);

  var panX,panY;
  var tweak_pan = function(moveX,moveY) { // in pixels
//       console.log("pan was (" + panX + "," + panY + ")" );
      panX += moveX * pixel_size;
      panY += moveY * pixel_size;
//       console.log("pan = (" + panX + "," + panY + ")" );
      gl.uniform2f(_pan,panX,panY);
      queue_draw();
  }

  var _position, _time, _zoom, _pan; // Attributes & uniforms
  var program = null;
  var choose_effect = function (frag) {
      // console.log("choose_effect: " + frag);
      // console.log("program == " + program);
      /* Try to clean up from previous effect. I don't know whether
         this step is necessary or sufficient. I still see the old
         programs in Firefox's Shader Editor.
      */
      if (program) gl.deleteProgram(program);
      program = gl.createProgram();
      gl.attachShader(program, load_shader(gl,"shaders/image.vert"));
      gl.attachShader(program, load_shader(gl,"shaders/"+frag+".frag"));
      gl.linkProgram(program);
      // Attributes & uniforms
      _position = gl.getAttribLocation(program, "position");
      _time = gl.getUniformLocation(program, "time");
      if (!_time) console.log("non-animated");
      _zoom = gl.getUniformLocation(program, "zoom");
      _pan  = gl.getUniformLocation(program, "pan");
      gl.enableVertexAttribArray(_position);
      gl.useProgram(program);
      panX = 0; panY = 0;
      // Resize to set pan & zoom uniforms.
      window.onresize();
      tweak_pan(0,0);
  };

  var redraw = function(t) {
      if (_time) {
          gl.uniform1f(_time, t/1000);
          queue_draw();
      }
      // gl.clear(gl.COLOR_BUFFER_BIT);
      // gl.clear(0);
      gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
      gl.vertexAttribPointer(_position, 2, gl.FLOAT, false,4*2,0) ;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      // gl.flush();
  };
  var queue_draw = function() { window.requestAnimationFrame(redraw); }
  var pixel_size; // in GL units
  window.onresize = function() {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      var mi = Math.min(w,h), ma = Math.max(w,h);
      gl.viewport((w-ma)/2, (h-ma)/2, ma,ma);
      gl.uniform1f(_zoom, mi/ma);
      pixel_size = 2/ma;
      // console.log("zoom == " + mi/ma + "; pixel_size == " + pixel_size);
      queue_draw();
  }
  var menu = document.getElementById("effect_menu");
  menu.onchange = function () {
      choose_effect(this.value);
  };
  menu.onchange();
  // window.onresize();
  // I tried event.movementX and event.movementY, but got undefined.
  // jQuery might help.
  var dragging = false;
  var prevX, prevY;
  canvas.onmousedown = function (event) {
      dragging = true;
      prevX = event.clientX; prevY = event.clientY;
      // console.log("down"); 
  };
  canvas.onmouseup = function (event) { dragging = false; /* console.log("up"); */ };
  canvas.onmousemove = function (event) {
      if (dragging) {
          var x = event.clientX, y = event.clientY;
          var dx = x-prevX, dy= prevY-y;  // note y inversion
          // console.log("delta = (" + dx + "," + dy + ")" );
          tweak_pan(dx,dy);
          prevX=x; prevY=y;
      }
  };

//   // Broken in firefox? Use jQuery.
//   canvas.draggable = true;
//   canvas.ondragstart = function (event) { console.log("drag start") };
//   canvas.ondrag = function (event) { console.log("drag") };

  window.onscroll = function () {
      console.log("scroll: " + window.pageXOffset + " " + window.pageYOffset);
  }

};
