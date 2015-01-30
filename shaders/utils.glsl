// Misc common definitions
precision mediump float;

vec2 rotate2(float theta, vec2 p) {
    float c = cos(theta), s = sin(theta);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec4 gray (float q) { return vec4(q,q,q,1); }

vec4 bw (bool b) { return gray(b?1.0:0.0); }

bool checker (vec2 p) {
    vec2 posM = mod(p,2.0);
    return posM.x < 1.0 ^^ posM.y < 1.0;
}

bool posX (vec2 p) { return p.x > 0.0; }

bool disk (vec2 p) { return (length(p) < 1.); }

bool disk (vec2 p, float radius, vec2 center) { return disk((p-center)/radius); }

bool disk (vec2 p, float radius) { return disk(p/radius); }

// bool disk (vec2 p, float radius) { return disk(p,radius,vec2(0.0,0.0)); }

//

const float pi = 3.14159265358979;
const float twoPi = 2.0*pi;

uniform float time;
uniform float magnify;
varying vec2 v_position;

vec4 effect (vec2 p);

void main () { gl_FragColor = effect(v_position / magnify); }
