// Misc common definitions
precision mediump float;

vec2 rotate2(float theta, vec2 p) {
    float c = cos(theta), s = sin(theta);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec4 gray (float q) { return vec4(q,q,q,1); }

vec4 bw (bool b) { return gray(b?1.0:0.0); }

uniform float time;
uniform float magnify;
varying vec2 v_position;

vec4 effect (vec2 pos);

void main () { gl_FragColor = effect(v_position / magnify); }
