#include 2d 

uniform float time;
uniform float delta;
uniform sampler2D texturePosition;

vec3 curl(float	x,	float	y,	float	z) {
    float	eps	= 1., eps2 = 2. * eps;
    float	n1,	n2,	a,	b;

    x += time * .05;
    y += time * .05;
    z += time * .05;

    vec3	curl = vec3(0.);

    n1	=	snoise(vec2( x,	y	+	eps ));
    n2	=	snoise(vec2( x,	y	-	eps ));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise(vec2( x,	z	+	eps));
    n2	=	snoise(vec2( x,	z	-	eps));
    b	=	(n1	-	n2)/eps2;

    curl.x	=	a	-	b;

    n1	=	snoise(vec2( y,	z	+	eps));
    n2	=	snoise(vec2( y,	z	-	eps));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise(vec2( x	+	eps,	z));
    n2	=	snoise(vec2( x	+	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.y	=	a	-	b;

    n1	=	snoise(vec2( x	+	eps,	y));
    n2	=	snoise(vec2( x	-	eps,	y));
    a	=	(n1	-	n2)/eps2;

    n1	=	snoise(vec2(  y	+	eps,	z));
    n2	=	snoise(vec2(  y	-	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.z	=	a	-	b;

    return	curl;
}

void main() {
    float maxDistance = 6.;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D(texturePosition, uv);
    vec3 pos = tmpPos.xyz;
    float f = 2.;
    float amplitude = 1.;
    vec3 target = pos + amplitude*curl(f*pos.x,f*pos.y, f*pos.z);
    float d = length( pos-target)/maxDistance;
    pos = mix(pos, target, pow(d, 5.));
    gl_FragColor = vec4( pos, 1.0);
}
