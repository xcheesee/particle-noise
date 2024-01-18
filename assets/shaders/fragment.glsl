uniform float time;
uniform float progress;
uniform sampler2D positionTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
void main() {
    gl_FragColor = vec4(0.1, 0.8, 0.4, 1.);
}