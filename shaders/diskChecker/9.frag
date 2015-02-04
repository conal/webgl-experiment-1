vec4 effect (vec2 p) {
    p = 1.5 * p;
    float t = 3.0*time;
    bool b = checker(2.*rotate(-0.5*time,(1.0+0.5*cos(time))*p));
    float sc = 2.0;
    b = disk(p/sc,0.5,vec2(cos(t),0.0)) ^^ b;
    b = disk(p/sc,0.5,vec2(0.0,sin(t))) ^^ b;
    return bw(b);
}
