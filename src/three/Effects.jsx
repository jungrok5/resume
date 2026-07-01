import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

// Postprocessing for the "flashy" look. Bloom makes emissive lines/nodes glow;
// vignette focuses the frame. Disabled on mobile from the caller.
export default function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.22} darkness={0.82} />
    </EffectComposer>
  )
}
