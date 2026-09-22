import { Component, type ReactNode, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CampusScene } from "./Campus";
import { SignatureMesh } from "./SignatureMesh";
import type { BuildingKind, Resource } from "../signature";

class StageBoundary extends Component<{ children: ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <div className="stage-fallback">{this.props.label}</div>;
    }
    return this.props.children;
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function CampusStage() {
  const reduced = useReducedMotion();
  return (
    <StageBoundary label="A campus of lit buildings, drawn as a still image when graphics are unavailable.">
      <Canvas
        camera={{ position: [7.4, 4.8, 9.2], fov: 36, near: 0.1, far: 60 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <CampusScene reduced={reduced} />
      </Canvas>
    </StageBoundary>
  );
}

export function SignatureStage({ kind, resource }: { kind: BuildingKind; resource: Resource }) {
  const reduced = useReducedMotion();
  return (
    <StageBoundary label="A week of resource use, shown as a still relief when graphics are unavailable.">
      <Canvas
        camera={{ position: [4.6, 3.15, 5.5], fov: 40, near: 0.1, far: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false }}
      >
        <SignatureMesh kind={kind} resource={resource} reduced={reduced} />
      </Canvas>
    </StageBoundary>
  );
}
