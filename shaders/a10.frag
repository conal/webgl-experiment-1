precision mediump float;
uniform float time;
varying vec2 vPos;
void main () {
    float a = 1.0;
    float b = time;
    float c = sin(b);
    float d = 1.0 / c;
    float e = cos(b);
    vec2  g = vPos;
    float k = d * dot(vec2(e,c),g);
    float s = d * dot(vec2(e,- c),g.yx);
    gl_FragColor = vec4(a - k + s * (k + (-1.0 + k)),s * k,k,a);
}
