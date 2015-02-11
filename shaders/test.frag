uniform float magnification;   // widget: slider 1,0.01,3
uniform float rotation;    // widget: slider 0,-5,5
uniform sampler2D video; // widget: video
vec4 effect (vec2 pos) { return tex2d(video,rotate(-rotation*time,pos)/magnification); }
