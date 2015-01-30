vec4 effect (vec2 pos) {
    pos = rotate2(time,pos);
    return bw(length(pos) < 0.5 ^^ pos.x > 0.0);
}
