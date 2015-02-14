uniform float disk_radius;   // widget: slider 0.5, 0, 2
vec4 effect (vec2 p) {
    return bw (disk(p,disk_radius) ^^ checker(2.*p));
}
