
export const PlanetSurfaceShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 baseColor;
    uniform vec3 sunDirection;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.7, 311.1))) * 43758.545); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      float n = noise(vUv * 10.0) * 0.5 + noise(vUv * 20.0) * 0.25;
      vec3 color = mix(baseColor, baseColor * 0.6, n);
      
      // Lighting
      float diff = max(dot(vNormal, normalize(sunDirection)), 0.0);
      float terminator = smoothstep(0.0, 0.2, diff);
      
      vec3 ambient = baseColor * 0.05;
      gl_FragColor = vec4(color * terminator + ambient, 1.0);
    }
  `
};

export const RingShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, vec2(0.5, 0.5));
      float ring = sin(dist * 150.0) * 0.5 + 0.5;
      float alpha = smoothstep(0.3, 0.32, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
      gl_FragColor = vec4(color * (0.8 + 0.2 * ring), alpha * 0.6);
    }
  `
};

export const SunShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, vec2(0.5));
      float sun = exp(-dist * 10.0);
      float rays = pow(max(0.0, sin(atan(vUv.y-0.5, vUv.x-0.5) * 8.0 + time)), 10.0) * 0.1;
      gl_FragColor = vec4(vec3(1.0, 0.9, 0.7), (sun + rays) * 1.5);
    }
  `
};

export const EtherShader = {
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float energy;
    varying vec3 vPosition;
    
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    void main() {
      float n = noise(vPosition * 0.005 + time * 0.02);
      vec3 color = mix(vec3(0.02, 0.01, 0.05), vec3(0.05, 0.02, 0.08), n);
      gl_FragColor = vec4(color, 0.05 + energy * 0.05);
    }
  `
};

export const MilkyWayShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float energy;
    varying vec2 vUv;
    
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec2 uv = vUv - 0.5;
      float dist = abs(uv.y);
      float mask = smoothstep(0.2, 0.0, dist);
      
      float n = noise(vUv * 10.0 + time * 0.1);
      vec3 color = mix(vec3(0.05, 0.02, 0.1), vec3(0.1, 0.08, 0.2), n);
      color = mix(color, vec3(0.4, 0.2, 0.6), mask * 0.5);
      
      gl_FragColor = vec4(color, mask * (0.1 + energy * 0.15));
    }
  `
};

export const ShootingStarShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      float dist = 1.0 - vUv.x;
      float alpha = smoothstep(0.0, 1.0, dist) * (1.0 - abs(vUv.y - 0.5) * 2.0);
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * opacity);
    }
  `
};

export const StarShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 color;
    attribute float twinkleSpeed;
    varying vec3 vColor;
    varying float vTwinkle;
    uniform float time;

    void main() {
      vColor = color;
      vTwinkle = sin(time * twinkleSpeed + position.x * 100.0) * 0.5 + 0.5;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (1000.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vTwinkle;
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 4.0);
      gl_FragColor = vec4(vColor * (1.2 + vTwinkle * 0.8), strength * (0.8 + 0.2 * vTwinkle));
    }
  `
};

export const MorphParticleShader = {
  vertexShader: `
    attribute float size;
    varying float vEnergy;
    uniform float time;
    uniform float energy;

    void main() {
      vEnergy = energy;
      vec3 pos = position;
      float angle = time * 0.5 + position.x * 0.1;
      pos.x += cos(angle) * energy * 2.0;
      pos.y += sin(angle) * energy * 2.0;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (800.0 / -mvPosition.z) * (1.0 + energy * 2.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying float vEnergy;
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 3.0);
      vec3 color = mix(vec3(0.5, 0.8, 1.0), vec3(1.0, 0.5, 0.2), vEnergy);
      gl_FragColor = vec4(color, strength * (0.3 + vEnergy * 0.6));
    }
  `
};

export const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vEyeVector = -normalize(mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float power;
    varying vec3 vNormal;
    varying vec3 vEyeVector;
    void main() {
      float dotProduct = max(dot(vNormal, vEyeVector), 0.0);
      float intensity = pow(1.0 - dotProduct, power);
      gl_FragColor = vec4(color, intensity);
    }
  `
};

export const CloudShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 sunDirection;
    varying vec2 vUv;
    varying vec3 vNormal;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.7, 311.1))) * 43758.545); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      float n = noise(vUv * 8.0 + time * 0.02) * noise(vUv * 15.0 - time * 0.01);
      float mask = smoothstep(0.4, 0.6, n);
      float diff = max(dot(vNormal, normalize(sunDirection)), 0.0);
      float terminator = smoothstep(-0.1, 0.2, diff);
      gl_FragColor = vec4(vec3(1.0), mask * 0.4 * terminator);
    }
  `
};

export const NebulaShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float opacity;
    uniform float warp;
    uniform int octaves;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;

    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x),
                 mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
             mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                 mix(hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100);
      for (int i = 0; i < 6; i++) {
        if(i >= octaves) break;
        v += a * noise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 p = vPosition * 0.04;
      float q = fbm(p + time * 0.1);
      float r = fbm(p + 1.0 * q + vec3(1.7, 9.2, 0.4) + time * 0.05);
      float n = fbm(p + warp * r);
      vec3 color = mix(color1, color2, n * 1.5);
      color = mix(color, vec3(0.1, 0.0, 0.2), q * 0.5);
      float alpha = smoothstep(0.1, 0.8, n) * opacity;
      alpha *= (1.0 - smoothstep(0.4, 0.6, abs(n - 0.5)));
      gl_FragColor = vec4(color, alpha);
    }
  `
};

export const GalaxyShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 coreColor;
    uniform vec3 armColor;
    uniform float type;
    uniform float swirl;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      float angle = atan(uv.y, uv.x);
      float core = exp(-dist * 12.0);
      float halo = exp(-dist * 5.0) * 0.3;
      float spiral = 0.0;
      if (type < 0.5) {
        float armAngle = angle + (1.0 / dist) * swirl;
        spiral = pow(max(0.0, sin(armAngle * 3.0)), 3.0) * exp(-dist * 4.0) * 0.5;
      } else {
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        spiral = noise * exp(-dist * 6.0) * 0.1;
      }
      vec3 color = mix(armColor, coreColor, core + spiral);
      float alpha = (core * 2.0 + spiral + halo);
      gl_FragColor = vec4(color, alpha * 0.8);
    }
  `
};

export const BlackHoleShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float detail;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      float horizon = smoothstep(0.09, 0.1, dist);
      float diskMask = smoothstep(0.11, 0.2, dist) * (1.0 - smoothstep(0.3, 0.5, dist));
      vec2 uv = vUv - 0.5;
      float angle = atan(uv.y, uv.x);
      float spiral = sin(angle * 5.0 + dist * 50.0 * detail - time * 8.0);
      float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 color = vec3(1.0, 0.4, 0.1) * (0.8 + 0.2 * spiral);
      color += vec3(1.0, 0.8, 0.3) * pow(diskMask, 2.0) * 2.5;
      float finalAlpha = (1.0 - horizon) + (diskMask * (0.6 + 0.4 * noise));
      gl_FragColor = vec4(color, finalAlpha);
    }
  `
};

export const PortalShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv - 0.5;
      float angle = atan(uv.y, uv.x);
      float dist = length(uv);
      float r1 = smoothstep(0.38, 0.4, dist) * (1.0 - smoothstep(0.4, 0.42, dist));
      float r2 = smoothstep(0.43, 0.44, dist) * (1.0 - smoothstep(0.44, 0.45, dist));
      float pulse = sin(time * 3.0 + dist * 20.0) * 0.5 + 0.5;
      float swirl = sin(angle * 8.0 - time * 5.0);
      vec3 color = vec3(0.2, 0.5, 1.0) * (r1 * 2.0 + r2 + swirl * r1);
      color *= (0.8 + 0.2 * pulse);
      gl_FragColor = vec4(color, (r1 + r2 * 0.5) * 0.9);
    }
  `
};
