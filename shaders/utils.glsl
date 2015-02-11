// Misc common definitions
precision mediump float;

vec2 rotate(float theta, vec2 p) {
    float c = cos(theta), s = sin(theta);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// vec4 gray (float q) { return vec4(q,q,q,1.0); }
vec4 gray (float q) {
    const float alpha = 1.0;
    return vec4(alpha*q,alpha*q,alpha*q,alpha);
}
vec4 bw (bool b) { return gray(b?1.0:0.0); }

bool checker (vec2 p) {
    vec2 posM = mod(p,2.0);
    return posM.x < 1.0 ^^ posM.y < 1.0;
}

bool checker (vec2 p,float frac) {
    vec2 posM = mod(p,1.0);
    return posM.x < frac ^^ posM.y < frac;
}

bool posX (vec2 p) { return p.x > 0.0; }

bool disk (vec2 p) { return (length(p) < 1.); }
bool disk (vec2 p, float radius, vec2 center) { return disk((p-center)/radius); }
bool disk (vec2 p, float radius) { return disk(p/radius); }

// bool disk (vec2 p, float radius) { return disk(p,radius,vec2(0.0,0.0)); }

bool inUnit (float a) { return 0.0 <= a && a <= 1.0; }
bool inUnit (vec2 p) { return inUnit(p.x) && inUnit(p.y); }

const vec4 clear = vec4(0.0,0.0,0.0,0.0);

vec4 tex2d(sampler2D sampler, vec2 p) {
    p = p/2.0 + 0.5;
    return (inUnit(p) ? texture2D(sampler,p) : clear);
}

// -----------------

const float pi = 3.14159265358979;
const float twoPi = 2.0*pi;

uniform float time;
uniform float zoom;
uniform vec2 pan;
varying vec2 v_position;

vec4 effect (vec2 p);

// void main () { gl_FragColor = effect(v_position / zoom - pan); }
void main () { gl_FragColor = effect((v_position - pan) / zoom); }

