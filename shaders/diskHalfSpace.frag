void main(void) {
    vec2 pos = v_position / magnify;
    vec2 w = rotate2(time,pos);
    bool b = length(pos) < 0.5 ^^ w.x > 0.0;
    float q = b?1.0:0.0;
    gl_FragColor = vec4(q,q,q,1);
}
