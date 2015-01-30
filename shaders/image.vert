attribute vec2 position;
varying vec2 vPos;

void main(void) {
    gl_Position = vec4(position, 0., 1.);
    vPos = position;
}

