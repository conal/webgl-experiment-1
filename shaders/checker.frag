vec4 effect (vec2 pos) {
    // pos = rotate2(time,pos);
    vec2 posM = mod(pos,1.0);
    return bw(posM.x < 0.5 ^^ posM.y < 0.5);
}
