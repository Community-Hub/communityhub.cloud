import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { sample, type BuildingKind, type Resource } from "../signature";

const HOURS = 24;
const DAYS = 7;
const CELLS = HOURS * DAYS;

const lowElectric = new THREE.Color("#16332f");
const midElectric = new THREE.Color("#6fbfa8");
const highElectric = new THREE.Color("#d6ff4a");
const peakElectric = new THREE.Color("#e8a15a");
const lowWater = new THREE.Color("#102e36");
const highWater = new THREE.Color("#9ee0d8");
const scratch = new THREE.Color();

function paint(value: number, resource: Resource, target: THREE.Color) {
  if (resource === "water") {
    target.copy(lowWater).lerp(highWater, value);
    return;
  }
  if (value < 0.45) target.copy(lowElectric).lerp(midElectric, value / 0.45);
  else if (value < 0.78) target.copy(midElectric).lerp(highElectric, (value - 0.45) / 0.33);
  else target.copy(highElectric).lerp(peakElectric, (value - 0.78) / 0.22);
}

export function SignatureMesh({
  kind,
  resource,
  reduced,
}: {
  kind: BuildingKind;
  resource: Resource;
  reduced: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const heights = useMemo(() => new Float32Array(CELLS).fill(0.2), []);
  const targets = useMemo(() => new Float32Array(CELLS), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    for (let day = 0; day < DAYS; day += 1) {
      for (let hour = 0; hour < HOURS; hour += 1) {
        targets[day * HOURS + hour] = sample(hour, day, kind, resource);
      }
    }
  }, [kind, resource, targets]);

  useFrame((_, delta) => {
    const bars = mesh.current;
    if (!bars) return;
    const ease = reduced ? 1 : 1 - Math.exp(-delta * 6);
    for (let day = 0; day < DAYS; day += 1) {
      for (let hour = 0; hour < HOURS; hour += 1) {
        const index = day * HOURS + hour;
        heights[index] += (targets[index] - heights[index]) * ease;
        const height = 0.08 + heights[index] * 3.4;
        dummy.position.set((hour - 11.5) * 0.34, height / 2, (day - 3) * 0.72);
        dummy.scale.set(0.26, height, 0.46);
        dummy.updateMatrix();
        bars.setMatrixAt(index, dummy.matrix);
        paint(heights[index], resource, scratch);
        bars.setColorAt(index, scratch);
      }
    }
    bars.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <color attach="background" args={["#101611"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 10, 6]} intensity={1.4} color="#f4f1ea" />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#8fd0c8" />
      <instancedMesh ref={mesh} args={[undefined, undefined, CELLS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.45} metalness={0.08} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10.5, 6.2]} />
        <meshStandardMaterial color="#0c1411" />
      </mesh>
      <gridHelper args={[10, 24, "#2a3830", "#1a2420"]} position={[0, 0.01, 0]} />
      <OrbitControls
        enablePan={false}
        autoRotate={!reduced}
        autoRotateSpeed={0.28}
        minDistance={4.2}
        maxDistance={10}
        minPolarAngle={0.55}
        maxPolarAngle={1.2}
        target={[0, 1.05, 0]}
      />
    </>
  );
}
