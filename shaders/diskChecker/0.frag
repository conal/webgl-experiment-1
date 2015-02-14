uniform float disk_radius;   // widget: slider 0.75, 0, 2
vec4 effect (vec2 p) {
    return bw (disk(p,disk_radius) ^^ checker(2.*p));
}
