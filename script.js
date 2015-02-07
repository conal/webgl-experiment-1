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
        sliders = extract_sliders(content),
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
    // console.log(path + " sliders: "); console.dir(sliders);
    return {shader: shader, sliders: sliders};
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
        // Find and initialize the slider parameter locations
        var sliders = frag.sliders;
        // console.log("sliders: "); console.dir(sliders);
        // TODO: Move to sliders construction, which requires access to the program.
        // Perhaps return the shader source instead of sliders from load_shader.
        $.each(sliders,function (_i,slider) {
                console.log("slider: ");console.dir(slider);
                (function () {
                var location = gl.getUniformLocation(program, slider.param),
                    param = slider.param;
                slider.set = function (val) {
                    console.log(param + " = " + val);
                    gl.uniform1f(location, val);
                } })();
                slider.set(slider.start);
            });
        return sliders;
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
    var sliders = choose_effect(effect);
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
    return sliders;
};

/*  Extracting GUI specifications  */

var slider_regexp = /^uniform\s+float\s+(\w+)\s*;\s*\/\/\s*slider:\s*(.*)\s*,\s*(.*)\s*,\s*(.*)$/gm;

function extract_sliders(shader_source) {
    var match, results = [];
    // console.log("extract_sliders:\n"+shader_source);
    slider_regexp.lastIndex = 0;
    do {
        match = slider_regexp.exec(shader_source);
        if (match) {
            // var param = match[1], start = match[2], min = match[3], max = match[4];
            // console.log("pushing param "+param);
            var slider_obj;
            slider_obj =
                { param: match[1], start: match[2], min: match[3], max: match[4],
                  render: function () {
                    // console.log("rendering param "+this.param);
                    // var slider_div = $("<div>"+this.param+"</div>");
                    var slider_div = $("<div/>");
                    var slider_min = this.min;
                    var scale = (this.max - this.min) / 10000;
                    var set = slider_obj.set;
                    var param = slider_obj.param;
                    slider_div.slider({ min: 0, max: 10000,
                                        value: (this.start - this.min) / scale,
                                        slide: function (event,ui) {
                                            console.log("slide "+param);
                                            // console.log("slide "+[ui.value,slider_min,scale,slider_min + ui.value*scale] );
                                            set(slider_min + ui.value*scale);
                                        },
                                       });
                    // slider_div.height("3px"); // My CSS tweak didn't work
                    // return slider_div;
                    return $("<div>"+this.param+"</div>").append(slider_div);
                  } };
        results.push(slider_obj);
        };
    } while (match);
    // console.log("sliders: ");console.dir(results);
    return results;
}

