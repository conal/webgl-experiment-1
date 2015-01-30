// Misc common definitions
precision mediump float;

vec2 rotate2(float theta, vec2 p) {
    float c = cos(theta), s = sin(theta);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

uniform float time;
uniform float magnify;
varying vec2 v_position;
