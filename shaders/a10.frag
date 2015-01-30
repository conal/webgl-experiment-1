precision mediump float;
uniform float time;
uniform float magnify;
varying vec2 v_position;

void main () {
    vec2 pos = v_position / magnify;
    float a = 1.0;
    float b = time;
    float c = sin(b);
    float d = 1.0 / c;
    float e = cos(b);
    vec2  g = pos;
    float k = d * dot(vec2(e,c),g);
    float s = d * dot(vec2(e,- c),g.yx);
    gl_FragColor = vec4(a - k + s * (k + (-1.0 + k)),s * k,k,a);
}