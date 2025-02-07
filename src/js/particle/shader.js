export const vertexShader = `
    uniform float time;
    uniform float audioFreq;
    uniform float pointSize;

    varying float vDistance;

    void main() {
        vec3 pos = position;
        
        float noise = sin(pos.x * 1.0 + time * 2.0) * 
                    cos(pos.y * 1.0 + time * 2.0) * 
                    sin(pos.z * 1.0 + time * 2.0) * 0.1;

        pos += pos * noise * (2.0 + audioFreq);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        vDistance = length(pos) * 2.0;
        
        float size = pointSize * (1.0 + audioFreq * 2.0);
        gl_PointSize = size * (1.0 - vDistance * 0.1);
    }
`;

export const fragmentShader = `
    uniform vec3 color;
    uniform float audioFreq;

    varying float vDistance;

    void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        float alpha = exp(-r * 2.0) * (1.0 - vDistance * 0.6);
        
        vec3 finalColor = color * (8.0 + audioFreq * 55.0);
        
        gl_FragColor = vec4(finalColor, alpha * 0.6);
    }
`;