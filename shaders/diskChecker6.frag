vec4 effect (vec2 p) {
    p = 1.5 * p;
    float t = 3.0*time;
    float c = cos(t), s = sin(t);
    bool b = checker(7.0*p + vec2(0.5*t,0.0));
    b = disk(p,0.5+0.5*s,vec2(c,0.0)) ^^ b;
    b = disk(p,0.5-0.5*s,vec2(0.0,s)) ^^ b;
    return bw(b);
}
