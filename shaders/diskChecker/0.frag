uniform float disk_radius;   // widget: slider 1.0, 0, 3
vec4 effect (vec2 p) {
    return bw (disk(p,disk_radius) ^^ checker(2.*p));
}
