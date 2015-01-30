precision mediump float;
uniform float time;
varying vec2 vPos;
void main(void) {
    float c = cos(time), s = sin(time);
    vec2 w = vec2(vPos.x * c - vPos.y * s, vPos.x * s + vPos.y * c);
    bool b = length(vPos) < 0.5 ^^ w.x > 0.0;
    float q = b?1.0:0.0;
    gl_FragColor = vec4(q,q,q,1);
}
