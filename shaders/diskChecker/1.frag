vec4 effect (vec2 p) {
    p = 2.0 * p;
    float t = 2.0*time;
    vec2 center = rotate(t,vec2(0.5,0));
    return bw (disk(p,1.0,center) ^^ checker(2.*p));
}
