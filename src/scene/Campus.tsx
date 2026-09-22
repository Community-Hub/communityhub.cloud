import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import type { BuildingKind } from "../signature";

const HUB = new THREE.Vector3(0, 2.35, 0);

type CampusBuilding = {
  id: BuildingKind;
  label: string;
  position: THREE.Vector3;
  size: [number, number, number];
  color: string;
};

const BUILDINGS: CampusBuilding[] = [
  {
    id: "residence",
    label: "Residence",
    position: new THREE.Vector3(-5.4, 0, -3.6),
    size: [1.85, 2.95, 1.45],
    color: "#d6ff4a",
  },
  {
    id: "lab",
    label: "Lab",
    position: new THREE.Vector3(5.6, 0, -3.4),
    size: [2.05, 3.75, 1.55],
    color: "#8fd0c8",
  },
  {
    id: "dining",
    label: "Dining",
    position: new THREE.Vector3(5.1, 0, 4.1),
    size: [2.45, 1.55, 1.85],
    color: "#e8a15a",
  },
  {
    id: "library",
    label: "Library",
    position: new THREE.Vector3(-4.9, 0, 4.4),
    size: [2.25, 2.55, 1.65],
    color: "#f3efe6",
  },
];

type Route = {
  from: BuildingKind;
  to: BuildingKind;
  color: string;
  speed: number;
  offset: number;
};

const ROUTES: Route[] = [
  { from: "residence", to: "dining", color: "#d6ff4a", speed: 0.22, offset: 0.0 },
  { from: "dining", to: "lab", color: "#e8a15a", speed: 0.19, offset: 0.18 },
  { from: "lab", to: "library", color: "#8fd0c8", speed: 0.21, offset: 0.36 },
  { from: "library", to: "residence", color: "#f3efe6", speed: 0.2, offset: 0.54 },
  { from: "residence", to: "lab", color: "#d6ff4a", speed: 0.17, offset: 0.72 },
  { from: "dining", to: "library", color: "#e8a15a", speed: 0.18, offset: 0.86 },
];

function buildingById(id: BuildingKind) {
  const found = BUILDINGS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown building ${id}`);
  return found;
}

function buildingTop(building: CampusBuilding) {
  return new THREE.Vector3(building.position.x, building.size[1] + 0.08, building.position.z);
}

function routeCurve(from: CampusBuilding, to: CampusBuilding) {
  const start = buildingTop(from);
  const end = buildingTop(to);
  const mid = start.clone().lerp(end, 0.5);
  mid.y = Math.max(start.y, end.y, HUB.y) + 1.35;
  const viaHub = new THREE.CubicBezierCurve3(
    start,
    start.clone().lerp(HUB, 0.55).add(new THREE.Vector3(0, 0.8, 0)),
    end.clone().lerp(HUB, 0.55).add(new THREE.Vector3(0, 0.8, 0)),
    end,
  );
  const direct = new THREE.QuadraticBezierCurve3(start, mid, end);
  return { viaHub, direct };
}

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
    uniform float uPulse;
    void main() {
      vec2 g = vUv * vec2(5.0, 10.0);
      vec2 f = fract(g);
      vec2 id = floor(g);
      float win = smoothstep(0.15, 0.22, f.x) * smoothstep(0.85, 0.78, f.x)
                * smoothstep(0.12, 0.2, f.y) * smoothstep(0.9, 0.82, f.y);
      float n = fract(sin(dot(id, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
      float on = step(0.38, fract(n * 3.1 + uTime * 0.04));
      vec3 plaster = vec3(0.055, 0.07, 0.062);
      vec3 lit = uColor * (0.42 + 0.58 * on + uPulse * 0.55);
      gl_FragColor = vec4(mix(plaster, lit, win), 1.0);
    }
  `,
};

function Building({
  building,
  pulses,
  reduced,
}: {
  building: CampusBuilding;
  pulses: MutableRefObject<Record<BuildingKind, number>>;
  reduced: boolean;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(building.color) },
          uSeed: { value: building.position.x * 1.7 + building.position.z * 2.3 },
          uPulse: { value: 0 },
        },
        vertexShader: windowShader.vertexShader,
        fragmentShader: windowShader.fragmentShader,
      }),
    [building],
  );

  const body = useRef<THREE.Mesh>(null);
  const beacon = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!reduced) material.uniforms.uTime.value = state.clock.elapsedTime;
    pulses.current[building.id] = Math.max(0, pulses.current[building.id] - delta * 2.1);
    const pulse = pulses.current[building.id];
    material.uniforms.uPulse.value = pulse;
    const scale = 1 + pulse * 0.035;
    if (body.current) {
      body.current.position.y = (building.size[1] / 2) * scale;
      body.current.scale.y = scale;
    }
    if (beacon.current) {
      beacon.current.position.y = building.size[1] + 0.12;
      const mat = beacon.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + pulse * 0.55;
    }
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={building.position.toArray()}>
      <mesh ref={body} position={[0, building.size[1] / 2, 0]} material={material}>
        <boxGeometry args={building.size} />
      </mesh>
      <mesh ref={beacon} position={[0, building.size[1] + 0.12, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={building.color} transparent opacity={0.35} />
      </mesh>
      <Html
        position={[0, building.size[1] + 0.55, 0]}
        center
        distanceFactor={14}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontFamily: "Outfit, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(243, 239, 230, 0.72)",
        }}
      >
        {building.label}
      </Html>
    </group>
  );
}

function Hub({ activity, reduced }: { activity: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.18;
    const pulse = 1 + activity * 0.22 + Math.sin(state.clock.elapsedTime * 2.4) * 0.04;
    if (core.current) core.current.scale.setScalar(pulse);
  });

  return (
    <group position={HUB.toArray()}>
      <mesh ref={core}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#f6f3ea" />
      </mesh>
      <mesh rotation={[Math.PI / 2.1, 0.2, 0]}>
        <torusGeometry args={[1.55, 0.016, 12, 96]} />
        <meshBasicMaterial color="#d6ff4a" transparent opacity={0.55 + activity * 0.35} />
      </mesh>
      <mesh rotation={[0.45, 0.9, 0.25]}>
        <torusGeometry args={[1.12, 0.013, 12, 80]} />
        <meshBasicMaterial color="#8fd0c8" transparent opacity={0.45 + activity * 0.3} />
      </mesh>
      <mesh rotation={[1.05, 0.15, 1.15]}>
        <torusGeometry args={[0.78, 0.011, 12, 64]} />
        <meshBasicMaterial color="#e8a15a" transparent opacity={0.4 + activity * 0.28} />
      </mesh>
      <pointLight color="#d6ff4a" intensity={14 + activity * 18} distance={11} />
      <Html
        center
        distanceFactor={16}
        position={[0, -0.55, 0]}
        style={{
          pointerEvents: "none",
          fontFamily: "Outfit, sans-serif",
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(214, 255, 74, 0.85)",
        }}
      >
        Data Hub
      </Html>
    </group>
  );
}

function NetworkLinks({ reduced }: { reduced: boolean }) {
  const segments = useMemo(() => {
    const lines: { points: THREE.Vector3[]; color: string }[] = [];
    for (const building of BUILDINGS) {
      const top = buildingTop(building);
      const points = [
        top,
        top.clone().lerp(HUB, 0.45).add(new THREE.Vector3(0, 1.1, 0)),
        HUB.clone().add(new THREE.Vector3(0, 0.15, 0)),
      ];
      lines.push({ points, color: building.color });
    }
    for (const route of ROUTES) {
      const { direct } = routeCurve(buildingById(route.from), buildingById(route.to));
      lines.push({ points: direct.getPoints(24), color: route.color });
    }
    return lines;
  }, []);

  return (
    <>
      {segments.map((segment, index) => (
        <Line
          key={index}
          points={segment.points}
          color={segment.color}
          transparent
          opacity={reduced ? 0.12 : 0.22}
          lineWidth={1}
        />
      ))}
    </>
  );
}

function DataPackets({
  reduced,
  onActivity,
  pulses,
}: {
  reduced: boolean;
  onActivity: (v: number) => void;
  pulses: MutableRefObject<Record<BuildingKind, number>>;
}) {
  const progress = useRef(ROUTES.map((route) => route.offset));
  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hubGlow = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    let activity = 0;
    ROUTES.forEach((route, index) => {
      progress.current[index] = (progress.current[index] + delta * route.speed) % 1;
      const t = progress.current[index];
      const { viaHub } = routeCurve(buildingById(route.from), buildingById(route.to));
      const point = viaHub.getPoint(t);
      const packet = packetRefs.current[index];
      if (packet) {
        packet.position.copy(point);
        const scale = 0.08 + Math.sin(t * Math.PI) * 0.05;
        packet.scale.setScalar(scale);
      }
      if (t < 0.08) pulses.current[route.from] = 1;
      if (t > 0.46 && t < 0.54) hubGlow.current = 1;
      if (t > 0.92) pulses.current[route.to] = 1;
      activity = Math.max(activity, Math.sin(t * Math.PI));
    });

    hubGlow.current = Math.max(0, hubGlow.current - delta * 2.8);
    onActivity(Math.max(activity, hubGlow.current));
  });

  return (
    <>
      {ROUTES.map((route, index) => (
        <mesh key={route.from + route.to} ref={(node) => { packetRefs.current[index] = node; }}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={route.color} transparent opacity={0.92} />
        </mesh>
      ))}
    </>
  );
}

function BuildingPulses({
  reduced,
  pulses,
}: {
  reduced: boolean;
  pulses: MutableRefObject<Record<BuildingKind, number>>;
}) {
  useFrame((state) => {
    if (reduced) return;
    const beat = (Math.sin(state.clock.elapsedTime * 0.9) + 1) * 0.5;
    BUILDINGS.forEach((building, index) => {
      const wave = Math.max(0, Math.sin(state.clock.elapsedTime * 1.4 + index * 1.2));
      pulses.current[building.id] = Math.max(
        pulses.current[building.id],
        wave * beat * 0.28,
      );
    });
  });

  return null;
}

function ResponsiveCamera({ reduced }: { reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const { camera, size } = useThree();

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const aspect = size.width / size.height;
    const wide = aspect > 1.55;
    const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.22) * 0.28;
    const tx = (wide ? 8.8 : 7.6) + (reduced ? 0 : pointer.current.x * 1.4) + sway;
    const ty = (wide ? 5.4 : 4.7) + (reduced ? 0 : pointer.current.y * -0.55);
    const tz = wide ? 11.2 : 9.4;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (ty - camera.position.y) * 0.04;
    camera.position.z += (tz - camera.position.z) * 0.04;
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = wide ? 44 : 38;
      camera.fov += (targetFov - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 1.65, 0);
  });

  return null;
}

const EMPTY_PULSES: Record<BuildingKind, number> = {
  residence: 0,
  lab: 0,
  dining: 0,
  library: 0,
};

export function CampusScene({ reduced }: { reduced: boolean }) {
  const pulses = useRef({ ...EMPTY_PULSES });
  const [hubActivity, setHubActivity] = useState(0);

  return (
    <>
      <color attach="background" args={["#101611"]} />
      <fog attach="fog" args={["#101611", 14, 32]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[6, 10, 5]} intensity={1.15} color="#f3efe6" />
      <directionalLight position={[-5, 4, -3]} intensity={0.35} color="#8fd0c8" />
      <ResponsiveCamera reduced={reduced} />
      <BuildingPulses reduced={reduced} pulses={pulses} />
      <DataPackets
        reduced={reduced}
        pulses={pulses}
        onActivity={(value) => {
          setHubActivity((prev) => (value > prev ? value : prev * 0.92));
        }}
      />
      <NetworkLinks reduced={reduced} />
      {BUILDINGS.map((building) => (
        <Building
          key={building.id}
          building={building}
          pulses={pulses}
          reduced={reduced}
        />
      ))}
      <Hub activity={hubActivity} reduced={reduced} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[18, 72]} />
        <meshBasicMaterial color="#0d1410" />
      </mesh>
      <gridHelper args={[24, 28, "#243028", "#18211c"]} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.2, 6.32, 96]} />
        <meshBasicMaterial color="#d6ff4a" transparent opacity={0.28} />
      </mesh>
    </>
  );
}
