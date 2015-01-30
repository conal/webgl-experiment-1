vec4 effect (vec2 pos) {
    // pos = rotate2(time,pos);
    vec2 diskCenter = rotate2(2.0*time,vec2(0.35,0));
    vec2 posM = mod(pos,2.0);
    return bw( (length(pos-diskCenter) < 0.5) ^^
               posM.x < 1.0 ^^ posM.y < 1.0 );
}
