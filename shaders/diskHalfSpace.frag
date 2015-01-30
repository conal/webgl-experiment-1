precision mediump float;
uniform float time;
uniform float magnify;
varying vec2 v_position;

vec2 rotate2(float theta, vec2 p) {
    float c = cos(theta), s = sin(theta);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main(void) {
    vec2 pos = v_position / magnify;
/*
    float c = cos(time), s = sin(time);
    vec2 w = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
*/
    vec2 w = rotate2(time,pos);
    bool b = length(pos) < 0.5 ^^ w.x > 0.0;
    float q = b?1.0:0.0;
    gl_FragColor = vec4(q,q,q,1);
}
