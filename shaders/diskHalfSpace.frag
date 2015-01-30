vec4 effect (vec2 p) {
    p = rotate2(time,p);
    return bw(disk(1.5*p) ^^ posX(p));
}
