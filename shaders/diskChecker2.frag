vec4 effect (vec2 p) {
    p = 2.0 * p;
    // vec2 diskCenter = rotate2(2.0*time,vec2(0.5,0));
    float t = 2.0*time;
    vec2 center = rotate2(t,vec2(0.5,0));
    float radius = 1.0 + 0.5 * sin(t);
    // p = rotate2(time,p);
    return bw (disk(p,radius,center) ^^ checker(2.0*p));
}
