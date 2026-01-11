
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoxGeometry, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer, AmbientLight, DirectionalLight, PointLight, InstancedMesh, Object3D, Color, Vector3 } from 'three';

interface Props {
  textureData?: string; // base64 texture
}

const ModelViewer: React.FC<Props> = ({ textureData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const lastMouse = useRef({ x: 0, y: 0 });
  const rotationSpeed = useRef({ x: 0, y: 0.01 });

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24); 
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const frontLight = new DirectionalLight(0xffffff, 1.2);
    frontLight.position.set(10, 10, 20);
    scene.add(frontLight);

    const backLight = new PointLight(0x00f0ff, 0.8, 50); 
    backLight.position.set(-10, 5, -10);
    scene.add(backLight);

    const bottomLight = new PointLight(0x7000ff, 0.5, 50);
    bottomLight.position.set(0, -10, 5);
    scene.add(bottomLight);

    // Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    groupRef.current = modelGroup;

    // --- VOXEL GENERATION ---
    if (textureData) {
      const img = new Image();
      img.src = `data:image/png;base64,${textureData}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // ANIMATION DETECTION:
        // If the image is taller than it is wide (e.g., 16x32, 16x64), it's likely an animation strip.
        // We only want to render the FIRST FRAME (top square) for the 3D model preview.
        let renderHeight = img.height;
        if (img.height > img.width) {
             renderHeight = img.width; // Assume square frames
        }

        // Voxel Geometry
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ 
          roughness: 0.2, 
          metalness: 0.1,
        });
        
        let voxelCount = 0;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // First pass: Count and find bounds (ONLY within the first frame)
        for (let y = 0; y < renderHeight; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4;
            if (data[index + 3] > 0) {
               voxelCount++;
               if (x < minX) minX = x;
               if (x > maxX) maxX = x;
               if (y < minY) minY = y;
               if (y > maxY) maxY = y;
            }
          }
        }

        const mesh = new InstancedMesh(geometry, material, voxelCount);
        const dummy = new Object3D();
        const color = new Color();
        
        let instanceIdx = 0;
        // Calculate center based on actual content bounds
        const contentWidth = maxX - minX + 1;
        const contentHeight = maxY - minY + 1;
        const centerX = minX + contentWidth / 2;
        const centerY = minY + contentHeight / 2;

        for (let y = 0; y < renderHeight; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4;
            const alpha = data[index + 3];

            if (alpha > 0) {
              const r = data[index] / 255;
              const g = data[index + 1] / 255;
              const b = data[index + 2] / 255;

              // Position relative to content center
              // Invert Y because canvas Y is down, 3D Y is up.
              // Note: We use renderHeight for centering relative to frame
              dummy.position.set(x - centerX, (renderHeight - y) - (renderHeight - centerY), 0);
              dummy.updateMatrix();
              
              mesh.setMatrixAt(instanceIdx, dummy.matrix);
              mesh.setColorAt(instanceIdx, color.setRGB(r, g, b));
              
              instanceIdx++;
            }
          }
        }
        
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        
        // Remove old meshes
        modelGroup.children.forEach(c => {
             if (c instanceof InstancedMesh) {
                 c.geometry.dispose();
                 // @ts-ignore
                 if (c.material.dispose) c.material.dispose();
             }
        });
        modelGroup.clear();
        modelGroup.add(mesh);
      };
    } else {
       // Placeholder
       const geo = new BoxGeometry(5, 5, 5);
       const mat = new MeshStandardMaterial({ color: 0x00f0ff, wireframe: true });
       const cube = new THREE.Mesh(geo, mat);
       groupRef.current.add(cube);
    }

    // --- ANIMATION LOOP ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      if (groupRef.current) {
         if (autoRotate && !isDragging) {
             groupRef.current.rotation.y += 0.01;
             groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
         }
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [textureData]);

  // --- INTERACTION HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    
    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;
    
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
     if (!cameraRef.current) return;
     const newZ = cameraRef.current.position.z + e.deltaY * 0.05;
     // Clamp zoom
     cameraRef.current.position.z = Math.max(5, Math.min(50, newZ));
  };

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-[2rem] border border-omni-primary/20 overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-gradient-to-t from-omni-primary/5 to-transparent pointer-events-none"></div>
      
      {/* 3D Canvas with Events */}
      <div 
        ref={mountRef} 
        className={`w-full h-full relative z-10 outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur">
          <div className={`w-2 h-2 rounded-full ${autoRotate ? 'bg-omni-primary animate-pulse' : 'bg-yellow-500'}`}></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
             {autoRotate ? 'Auto-Spin' : 'Interactive Mode'}
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
         <button onClick={() => setAutoRotate(!autoRotate)} className="text-[10px] font-bold uppercase tracking-widest text-omni-muted hover:text-white bg-black/40 px-3 py-1 rounded border border-white/5 hover:border-white/20 transition-all">
            {autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
         </button>
      </div>

      <div className="absolute bottom-6 right-6 z-20 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none">
         <span className="text-[9px] font-mono text-omni-muted uppercase">Drag to Rotate • Scroll to Zoom</span>
      </div>
    </div>
  );
};

export default ModelViewer;
