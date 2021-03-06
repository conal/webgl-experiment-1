vec4 effect (vec2 p) {
    p = 1.5 * p;
    float t = 3.0*time;
    // bool b = checker(2.*rotate(0.5*time,p/(1.2+cos(time))));
    bool b = checker(rotate(pi/4. + time/50.,3.*p) + vec2(.5*time,0));
    b = disk(p,0.5,vec2(cos(t),0.0)) ^^ b;
    b = disk(p,0.5,vec2(0.0,sin(t))) ^^ b;
    return bw(b);
}
