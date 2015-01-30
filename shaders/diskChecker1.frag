vec4 effect (vec2 pos) {
    vec2 diskCenter = rotate2(2.0*time,vec2(0.5,0));
    pos = 2.0 * pos;
    // pos = rotate2(time,pos);
    return bw (disk(pos-diskCenter) ^^ checker(2.*pos));
}
