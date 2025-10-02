import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ShaderAnimationProps {
  className?: string;
  style?: React.CSSProperties;
}

const ShaderAnimation: React.FC<ShaderAnimationProps> = ({ className, style }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // Create diagonal coordinate system
          float diagonal = (uv.x + uv.y) * 0.5;
          float perpendicular = (uv.x - uv.y) * 0.5;
          
          // Create animated diagonal stripes
          float stripePattern = sin(diagonal * 15.0 + u_time * 1.5) * 0.5 + 0.5;
          float wavePattern = sin(perpendicular * 10.0 + u_time * 2.0) * 0.3 + 0.7;
          
          // Create multiple color bands
          vec3 color1 = vec3(1.0, 0.3, 0.0); // Orange/Red
          vec3 color2 = vec3(1.0, 0.7, 0.0); // Yellow/Orange
          vec3 color3 = vec3(0.0, 0.5, 1.0); // Blue
          vec3 color4 = vec3(0.3, 0.0, 1.0); // Deep Blue
          vec3 color5 = vec3(0.8, 0.0, 0.8); // Purple
          
          // Create flowing color transitions
          float colorMix1 = sin(diagonal * 8.0 + u_time * 1.2) * 0.5 + 0.5;
          float colorMix2 = sin(diagonal * 12.0 + u_time * 1.8) * 0.5 + 0.5;
          float colorMix3 = sin(diagonal * 6.0 + u_time * 0.9) * 0.5 + 0.5;
          
          // Mix colors in layers
          vec3 layer1 = mix(color1, color2, colorMix1);
          vec3 layer2 = mix(color3, color4, colorMix2);
          vec3 layer3 = mix(color4, color5, colorMix3);
          
          // Combine layers with stripe pattern
          vec3 finalColor = mix(layer1, layer2, stripePattern);
          finalColor = mix(finalColor, layer3, wavePattern * 0.4);
          
          // Add brightness variation
          float brightness = 0.8 + 0.3 * sin(u_time * 1.5 + diagonal * 5.0);
          finalColor *= brightness;
          
          // Add subtle shimmer effect
          float shimmer = 0.1 * sin(u_time * 3.0 + uv.x * 20.0) * sin(u_time * 2.5 + uv.y * 25.0);
          finalColor += shimmer;
          
          gl_FragColor = vec4(finalColor, 0.6);
        }
      `,
    });

    // Create geometry and mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      if (shaderMaterial.uniforms.u_time) {
        shaderMaterial.uniforms.u_time.value += 0.01;
      }
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      renderer.setSize(width, height);
      if (shaderMaterial.uniforms.u_resolution) {
        shaderMaterial.uniforms.u_resolution.value.set(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Store the current ref value to avoid the ESLint warning
      const currentMount = mountRef.current;
      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};

export default ShaderAnimation;
