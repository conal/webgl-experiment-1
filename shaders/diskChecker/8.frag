vec4 effect (vec2 p) {
    p = 1.5 * p;
    float t = 2.0*time;
    float c = cos(t), s = sin(t);
    vec2 dc = 1.0*vec2(t,0.0);
    // vec2 dc = 5.0*vec2(sin(3.0*time),cos(2.5*time));
    bool b = checker(7.0*p + dc);
    // float dr = 1.0*sin(pi*cos(2.0*time));
    float dr = 1.0*s;
    b = disk(p,0.5+dr,vec2(c,0.0)) ^^ b;
    b = disk(p,0.5-dr,vec2(0.0,s)) ^^ b;
    return bw(b);
}
