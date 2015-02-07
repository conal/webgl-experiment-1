uniform float radius;  // slider: 1.0, 0, 3
uniform float offset;  // slider: 1.0, 0, 2
vec4 effect (vec2 p) {
    float t = 2.0*time;
    vec2 center = rotate(t,vec2(offset,0));
    return bw (disk(p,radius,center) ^^ checker(2.*p));
}

