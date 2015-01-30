precision mediump float;
uniform float time;
uniform float magnify;
varying vec2 v_position;

void main(void) {
    vec2 pos = v_position / magnify;
    vec2 posM = mod(pos,1.0);
    bool b = posM.x < 0.5 ^^ posM.y < 0.5;
    float q = b?1.0:0.0;
    gl_FragColor = vec4(q,q,q,1);
}
