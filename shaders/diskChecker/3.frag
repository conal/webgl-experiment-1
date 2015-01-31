vec4 effect (vec2 p) {
    p = 1.5 * p;
    // vec2 diskCenter = rotate(2.0*time,vec2(0.5,0));
    // p = rotate(time,p);
    bool b = checker(2.*p);
    const int n = 5;
    const float slice = twoPi / float(n);
    for (int i=0;i<n;i++) {
        float t = (time + slice*float(i));
        vec2 center = rotate(t,vec2(1,0));
        b = disk(p,0.5,center) ^^ b;
    }
    return bw(b);
}
