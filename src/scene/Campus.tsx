import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BUILDINGS: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}[] = [
  { position: [-4.4, 0, -1.4], size: [1.55, 2.35, 1.15], color: "#d6ff4a" },
  { position: [-2.15, 0, 1.7], size: [1.25, 3.55, 1.2], color: "#8fd0c8" },
  { position: [2.55, 0, -2.15], size: [1.9, 1.65, 1.35], color: "#e8a15a" },
  { position: [4.25, 0, 0.55], size: [1.2, 2.9, 1.05], color: "#d6ff4a" },
  { position: [0.55, 0, 2.75], size: [2.2, 1.25, 1.15], color: "#8fd0c8" },
  { position: [-0.15, 0, -3.15], size: [1.55, 4.25, 1.2], color: "#f3efe6" },
  { position: [1.7, 0, 1.15], size: [1.05, 2.05, 1.35], color: "#e8a15a" },
];

const COUNT = 640;

const windowShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSeed;
    void main() {
      vec2 g = vUv * vec2(5.0, 10.0);
      vec2 f = fract(g);
      vec2 id = floor(g);
      float win = smoothstep(0.15, 0.22, f.x) * smoothstep(0.85, 0.78, f.x)
                * smoothstep(0.12, 0.2, f.y) * smoothstep(0.9, 0.82, f.y);
      float n = fract(sin(dot(id, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
      float on = step(0.38, fract(n * 3.1 + uTime * 0.04));
      vec3 plaster = vec3(0.055, 0.07, 0.062);
      vec3 lit = uColor * (0.45 + 0.55 * on);
      gl_FragColor = vec4(mix(plaster, lit, win), 1.0);
    }
  `,
};

function Building({
  position,
  size,
  color,
  reduced,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  reduced: boolean;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uSeed: { value: Math.random() * 20 },
        },
        vertexShader: windowShader.vertexShader,
        fragmentShader: windowShader.fragmentShader,
      }),
    [color],
  );

  useFrame((state) => {
    if (!reduced) material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh position={[position[0], size[1] / 2, position[2]]} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

function Rings({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.z = Math.sin(group.current.rotation.y) * 0.08;
  });

  return (
    <group ref={group} position={[0, 2.15, 0]}>
      <mesh rotation={[Math.PI / 2.15, 0.15, 0]}>
        <torusGeometry args={[1.45, 0.014, 12, 96]} />
        <meshBasicMaterial color="#d6ff4a" />
      </mesh>
      <mesh rotation={[0.4, 0.8, 0.2]}>
        <torusGeometry args={[1.05, 0.012, 12, 80]} />
        <meshBasicMaterial color="#8fd0c8" />
      </mesh>
      <mesh rotation={[1.1, 0.2, 1.2]}>
        <torusGeometry args={[0.72, 0.01, 12, 64]} />
        <meshBasicMaterial color="#e8a15a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshBasicMaterial color="#f6f3ea" />
      </mesh>
      <pointLight color="#d6ff4a" intensity={18} distance={9} />
    </group>
  );
}

function Flow({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const meta = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        building: Math.floor(Math.random() * BUILDINGS.length),
        t: Math.random(),
        speed: 0.07 + Math.random() * 0.14,
        lift: 0.15 + Math.random() * 0.55,
      })),
    [],
  );

  useFrame((_, delta) => {
    const attr = points.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (!attr) return;
    const step = reduced ? 0 : delta;
    for (let i = 0; i < COUNT; i += 1) {
      const item = meta[i];
      item.t = (item.t + step * item.speed) % 1;
      const building = BUILDINGS[item.building];
      const sx = building.position[0];
      const sy = building.size[1];
      const sz = building.position[2];
      const t = item.t;
      const u = 1 - t;
      const cx = sx * 0.35;
      const cy = Math.max(sy, 2.15) + item.lift;
      const cz = sz * 0.35;
      attr.setXYZ(
        i,
        u * u * sx + 2 * u * t * cx,
        u * u * sy + 2 * u * t * cy + t * t * 2.15,
        u * u * sz + 2 * u * t * cz,
      );
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d6ff4a"
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

function CameraDrift({ reduced }: { reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.35;
    const tx = 7.4 + (reduced ? 0 : pointer.current.x * 1.6) + sway;
    const ty = 4.8 + (reduced ? 0 : pointer.current.y * -0.7);
    const tz = 9.2;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (ty - camera.position.y) * 0.04;
    camera.position.z += (tz - camera.position.z) * 0.04;
    camera.lookAt(0, 1.5, 0);
  });

  return null;
}

export function CampusScene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={["#101611"]} />
      <fog attach="fog" args={["#101611", 11, 28]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#f3efe6" />
      <CameraDrift reduced={reduced} />
      {BUILDINGS.map((building) => (
        <Building key={building.position.join("-")} {...building} reduced={reduced} />
      ))}
      <Rings reduced={reduced} />
      <Flow reduced={reduced} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[16, 72]} />
        <meshBasicMaterial color="#0d1410" />
      </mesh>
      <gridHelper args={[22, 26, "#243028", "#18211c"]} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[5.6, 5.68, 80]} />
        <meshBasicMaterial color="#d6ff4a" transparent opacity={0.35} />
      </mesh>
    </>
  );
}
