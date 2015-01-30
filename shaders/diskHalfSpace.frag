vec4 effect (vec2 pos) {
    pos = rotate2(time,pos);
    return bw(disk(1.5*pos) ^^ pos.x > 0.0);
}
