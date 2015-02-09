uniform float disk_radius;   // slider: 1.0, 0, 3
uniform float orbit_radius;  // slider: 1.0, 0, 2
vec4 effect (vec2 p) {
    float t = 2.0*time;
    vec2 center = rotate(t,vec2(orbit_radius,0));
    return bw (disk(p,disk_radius,center) ^^ checker(2.*p));
}
