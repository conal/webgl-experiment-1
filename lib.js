// When file://, works in Safari but not Firefox or Chrome.
// Otherwise, for local use, do the following in a shell:
//     cd path-to-files
//     python -m SimpleHTTPServer
// Then point your browser to
//     http://localhost:8000
function get_file_text(path) {
    var content;
    // console.log("get "+path);
    jQuery.ajax({
         url: path,
         success: function (result) {
                    // console.log(result);
                    content = result;
                  },
         async: false,
    });
    if (!content)
        throw ("Couldn't find file " + path);
    return content;
};

var utils_glsl = get_file_text("shaders/utils.glsl") + "\n\n";

function get_extension(path) {
    var ext = path.split('.').pop();
    return (ext == path) ? '' : ext;
}

function load_shader(gl,path) {
    var ext = get_extension(path),
        content = get_file_text(path),
        widgets = extract_widgets(content),
        shader;
    switch (ext) {
    case "vert":
        shader = get_shader(gl,content, gl.VERTEX_SHADER, "vertex");
        break;
    case "frag":
        shader = get_shader(gl,utils_glsl + content, gl.FRAGMENT_SHADER, "fragment");
        break;
    default:
        throw("load_shader: unknown extension "+ext);
    }
    // console.log(path + " widgets: "); console.dir(widgets);
    return { shader: shader, widgets: widgets };
}

function get_shader(gl,source, type, typeString) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("ERROR IN "+typeString+ " shader:\n" + gl.getShaderInfoLog(shader));
        return false;
    }
    // console.dir(shader);
    return shader;
};

function install_effect(canvas,effect) {
    // console.log("install_effect " + effect);
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
    /*
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    */
    gl.clearColor(1.0, 0.0, 0.0, 0.0);

    var panX,panY;
    var tweak_pan = function(moveX,moveY) { // in pixels
        // console.log("pan was (" + panX + "," + panY + ")" );
        panX += moveX * pixel_size;
        panY += moveY * pixel_size;
        // console.log("pan = (" + panX + "," + panY + ")" );
        gl.uniform2f(_pan,panX,panY);
        queue_draw();
    }

    var fpsElems = $("#fps");
    fpsElems.css("opacity",0);
    // console.log("fpsElems: "+fpsElems);

    var _position, _time, _zoom, _pan; // Attributes & uniforms
    var program = null;
    var choose_effect = function (frag_source) {
        // console.log("choose_effect: " + frag_source);
        // console.log("program == " + program);
        /* Try to clean up from previous effect. I don't know whether
           this step is necessary or sufficient. I still see the old
           programs in Firefox's Shader Editor.
        */
        if (program) gl.deleteProgram(program);
        program = gl.createProgram();
        gl.attachShader(program, load_shader(gl,"shaders/image.vert").shader);
        var frag = load_shader(gl,"shaders/"+frag_source+".frag");
        gl.attachShader(program, frag.shader);
        gl.linkProgram(program);
        // Attributes & uniforms
        _position = gl.getAttribLocation(program, "position");
        _time = gl.getUniformLocation(program, "time");
        // if (!_time) console.log("non-animated");
        _zoom = gl.getUniformLocation(program, "zoom");
        _pan  = gl.getUniformLocation(program, "pan");
        gl.enableVertexAttribArray(_position);
        gl.useProgram(program);
        panX = 0; panY = 0;
        // Resize to set pan & zoom uniforms.
        canvas.onresize();
        tweak_pan(0,0);
        // Set up GUI elements
        // console.log("widgets: "); console.dir(widgets);
        function render_widget(widget) {
            // console.log("render_widget: ");console.dir(widget);
            var location = gl.getUniformLocation(program, widget.param);
            if (true || location) {  // if actually used
              var widget_div = $("<div></div>");
              switch (widget.type) {
              case "slider":
                var scale = (widget.max - widget.min) / 10000;
                function set (val) { gl.uniform1f(location, val); queue_draw(); }
                set(widget.start);
                widget_div.slider({ min: 0, max: 10000,
                                    value: (widget.start - widget.min) / scale,
                                    slide: function (_event,ui) {
                                               // console.log("slide "+widget.param);
                                               set(widget.min + ui.value*scale);
                                           }
                                  });
                break;
/*
              case "video":
                  // console.log("Rendering video widget.");
                  var video = $("<video autoplay muted loop=true controls src=media/creek.mp4 />");
                  var texture = makeTexture(gl);
                  // Texture unit 0 for now. TODO: reserve a unit and use in updateTexture.
                  gl.uniform1i(location, 0);
                  var update;
                  update = function () {
                      // console.log("video update")
                      updateTexture(gl,texture,video[0]);
                      queue_draw();
                      window.requestAnimationFrame(update);
                  };
                  window.requestAnimationFrame(update);
                  $(widget_div).append(video);
                  break;
*/
              case "webcam":
                  (function (gl,location,widget_div) {
                  // console.log("Rendering webcam widget.");
                  var video = $("<video class=center autoplay />");
                  var texture = makeTexture(gl);
                  // Texture unit 0 for now. TODO: reserve a unit and use in updateTexture.
                  gl.uniform1i(location, 0);
                  navigator.getUserMedia(
                      { audio: false, video: true },
                      function (stream) {
                          video[0].src = window.URL.createObjectURL(stream); },
                      function (e) { console.log(e); });
                  var update;
                  update = function () {
                      // console.log("webcam update")
                      updateTexture(gl,texture,video[0]);
                      queue_draw();
                      window.requestAnimationFrame(update);
                  };
                  window.requestAnimationFrame(update);
                  $(widget_div).append(video); // show preview
                  })(gl,location,widget_div);
                  break;
              default:
                  alert("render_widget: unrecognized widget type " + widget.type);
                  $("unknown widget " + widget.type).append(widget_div);
                  break;
              }
              return $("<div class=widget-and-label><div class=widget-label>"
                       +widget.param.replace(/_/g," ")+"</div></div>").append(widget_div);

            }
        }
        // return (function () { return $.map(frag.widgets,render_widget); });
        return $.map(frag.widgets,render_widget);
    };
    var lastSeconds=0,lastFPS=0;
    var pendingRedraw = false;
    // TODO: maybe always run the redraw loop, but use a needsRedraw flag.
    // Probably okay for a single effect, but what about thumbnails?
    var drawn = false;   // has been drawn at least once
    var redraw = function (milliseconds) {
        // console.log("redraw. pending = " + pendingRedraw);
        pendingRedraw = false;
        var seconds = milliseconds/1000,
            elapsed = seconds - lastSeconds;
        if (seconds != lastSeconds) {
            if (fpsElems.length > 0) {
                // console.log("elapsed = " + elapsed);
                var thisFPS = 1/elapsed;
                var fpsWeight = 0.1; // weight of new fps
                lastFPS = thisFPS * fpsWeight + lastFPS * (1 - fpsWeight);
                var roundFPS = Math.round(lastFPS);
                if (drawn) {
                    fpsElems.stop();  // in case already animating
                    fpsElems.css("opacity",1);
                    fpsElems.fadeTo(1000,0);
                    // console.log("lastFPS = " + lastFPS);
                    if (roundFPS != 0)
                        fpsElems.html("fps: " + roundFPS);
                } else
                    drawn = true;
            }
            lastSeconds = seconds;
            if (_time) {
                gl.uniform1f(_time, seconds);
                queue_draw();
            }
            // gl.clear(gl.COLOR_BUFFER_BIT);
            // gl.clear(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
            gl.vertexAttribPointer(_position, 2, gl.FLOAT, false,4*2,0) ;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            // gl.flush();
        }
    };
    var queue_draw = function () {
        if (!pendingRedraw) {
            pendingRedraw = true;
            window.requestAnimationFrame(redraw);
        } else {
            // console.log("queue_draw: already pending");
        }
    }
    var pixel_size; // in GL units

    canvas.onresize = function () {
        var w = canvas.width, h = canvas.height;
        // console.log("canvas size == ",[w,h]);
        var mi = Math.min(w,h), ma = Math.max(w,h);
        gl.viewport((w-ma)/2, (h-ma)/2, ma,ma);
        gl.uniform1f(_zoom, mi/ma);
        pixel_size = 2/ma;
        // console.log("zoom == " + mi/ma + "; pixel_size == " + pixel_size);
        queue_draw();
    }
    // choose_effect(canvas.innerHTML);
    var widgets = choose_effect(effect);
    // canvas.onresize();
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
    return widgets;
};

/*  Extracting GUI specifications  */

var widget_regexp = /^uniform\s+(\w+)\s+(\w+)\s*;\s*\/\/\s*widget:\s*(\w+)(.*)$/gm;

var slider_regexp = /^\s*(.*)\s*,\s*(.*)\s*,\s*(.*)\s*$/;

// TODO: Split into a standard form followed by widget-specifics.

function extract_widgets(shader_source) {
    var match, results = [];
    // console.log("extract_widgets:\n"+shader_source);
    widget_regexp.lastIndex = 0;
    do {
        match = widget_regexp.exec(shader_source);
        // console.log("match: ");console.log(match);
        if (match) {
            var widget = { param: match[2], type: match[3] };
            // console.log("Widget "+widget.param+" as "+widget.type+".");
            switch (widget.type) {
            case "slider":
                slider_regexp.lastIndex = 0;
                var slider_match = slider_regexp.exec(match[4]);
                if (slider_match) {
                    var pn = function (i) { return parseFloat(slider_match[i]); };
                    $.extend(widget,{ start: pn(1), min: pn(2), max: pn(3) });
                } else
                    alert("bad slider spec: " + match[4]);
                // console.log("extended: ");console.dir(widget);
                break;
            case "webcam": break;
            case "video": break;
            default:
                alert("extract_widgets: unrecognized widget: " + widget.type);
                break;
            }
            results.push(widget);
        };
    } while (match);
    // console.log("widgets: ");console.dir(results);
    return results;
}

function makeTexture(gl) {
  // console.log("makeTexture");
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function updateTexture(gl,texture,source) {
  // console.log("updateTexture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
}

$(function () {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (!navigator.getUserMedia)
       console.log('getUserMedia not supported in this browser.');
});
