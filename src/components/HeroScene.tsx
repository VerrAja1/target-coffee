/* eslint-disable react-hooks/immutability -- three.js scene, material, and geometry objects are mutated by design */
import { Suspense, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Export of the supplied glass asset, already reduced to the middle cup:
 * the source file packs three cups in a row along X, and `scripts/prepare-model.mjs`
 * keeps the pair of meshes whose bounding box is centred on the origin.
 */
const MODEL_URL = `${import.meta.env.BASE_URL}models/glass-cup.glb`
const CUP_HEIGHT = 1.62
const CUP_BOTTOM = -CUP_HEIGHT / 2

function SceneEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = environment.texture
    return () => {
      scene.environment = null
      environment.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}

function useRadialTexture(stops: ReadonlyArray<[number, string]>) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(128, 118, 8, 128, 128, 126)
      for (const [offset, color] of stops) gradient.addColorStop(offset, color)
      context.fillStyle = gradient
      context.fillRect(0, 0, 256, 256)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [stops])
}

function useStreakTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 128
    const context = canvas.getContext('2d')
    if (context) {
      const horizontal = context.createLinearGradient(0, 0, 64, 0)
      for (const [offset, color] of streakStops) horizontal.addColorStop(offset, color)
      context.fillStyle = horizontal
      context.fillRect(0, 0, 64, 128)

      context.globalCompositeOperation = 'destination-in'
      const vertical = context.createLinearGradient(0, 0, 0, 128)
      vertical.addColorStop(0, 'rgba(0,0,0,0)')
      vertical.addColorStop(0.2, 'rgba(0,0,0,1)')
      vertical.addColorStop(0.8, 'rgba(0,0,0,1)')
      vertical.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = vertical
      context.fillRect(0, 0, 64, 128)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

const haloStops: ReadonlyArray<[number, string]> = [
  [0, 'rgba(214,168,116,0.22)'],
  [0.38, 'rgba(196,132,86,0.11)'],
  [0.7, 'rgba(90,58,38,0.03)'],
  [1, 'rgba(18,16,14,0)'],
]

const streakStops: ReadonlyArray<[number, string]> = [
  [0, 'rgba(255,226,189,0)'],
  [0.35, 'rgba(255,226,189,0.32)'],
  [0.55, 'rgba(255,240,220,0.5)'],
  [0.72, 'rgba(255,226,189,0.24)'],
  [1, 'rgba(255,226,189,0)'],
]

const shadowStops: ReadonlyArray<[number, string]> = [
  [0, 'rgba(8,6,5,0.72)'],
  [0.45, 'rgba(8,6,5,0.28)'],
  [1, 'rgba(8,6,5,0)'],
]

/**
 * A warm glow behind the cup, inside the scene on purpose: a glass with
 * transmission refracts its own render target, so a CSS glow behind the canvas
 * would leave the glass reading as a black hole.
 */
function Halo() {
  const texture = useRadialTexture(haloStops)
  return (
    <mesh position={[0, 0.1, -2.3]}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/**
 * Soft vertical light streaks behind the glass. Transmission turns them into
 * the bright edges and distortion that make a single-shell glass read as glass.
 */
function Streaks() {
  const texture = useStreakTexture()
  return (
    <group position={[0, 0.1, -1.55]}>
      <mesh position={[-1.02, 0, 0]}>
        <planeGeometry args={[0.42, 3.4]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.7} />
      </mesh>
      <mesh position={[1.08, 0.12, 0]}>
        <planeGeometry args={[0.26, 3]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.45} />
      </mesh>
    </group>
  )
}

/**
 * The shipped asset material is a 2.3% black shell, which reads as a hole under
 * this stage's lighting, so the glass gets a physical transmission material and
 * the drink keeps its baked latte texture.
 */
function useCupMaterials(gltf: GLTF) {
  const drinkTexture = useMemo(() => {
    let map: THREE.Texture | null = null
    gltf.scene.traverse((child) => {
      if (map || !(child as THREE.Mesh).isMesh) return
      const material = (child as THREE.Mesh).material
      if (Array.isArray(material)) return
      const standard = material as THREE.MeshStandardMaterial
      if (standard.map) map = standard.map
    })
    return map
  }, [gltf])

  const materials = useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#fffaf2'),
      metalness: 0,
      roughness: 0.02,
      transmission: 1,
      thickness: 0.1,
      ior: 1.45,
      attenuationColor: new THREE.Color('#e8c9a4'),
      attenuationDistance: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.2,
      specularIntensity: 1,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const drink = new THREE.MeshPhysicalMaterial({
      ...(drinkTexture ? { map: drinkTexture } : { color: new THREE.Color('#5a3620') }),
      color: new THREE.Color('#9c6f4a'),
      metalness: 0,
      roughness: 0.34,
      clearcoat: 0.45,
      clearcoatRoughness: 0.24,
      envMapIntensity: 0.2,
    })
    return { glass, drink }
  }, [drinkTexture])

  useEffect(() => () => {
    materials.glass.dispose()
    materials.drink.dispose()
  }, [materials])

  return materials
}

/**
 * The exported shell is a single surface with no thickness, so it refracts the
 * drink almost untouched and reads as a soft sleeve. A hairline rim on the lip
 * gives the top edge a specular line, which is the cue that says "glass".
 * The radius and height are measured from the lip vertices, not guessed.
 */
function Cup() {
  const gltf = useLoader(GLTFLoader, MODEL_URL)
  const materials = useCupMaterials(gltf)

  const { model, rim } = useMemo(() => {
    const root = gltf.scene
    let shell: THREE.Mesh | null = null

    root.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshStandardMaterial
      if (!material.map) shell = mesh
      mesh.material = material.map ? materials.drink : materials.glass
      mesh.frustumCulled = false
    })

    // Normalise whatever units the export used: centre the bounding box on the
    // origin and scale it to the height the camera is framed for.
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = CUP_HEIGHT / Math.max(size.y, 0.0001)

    const group = new THREE.Group()
    group.add(root)
    group.scale.setScalar(scale)
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    group.updateMatrixWorld(true)

    // Measure the lip: the top band of the shell mesh. Its widest point is the
    // radius the rim ring has to sit on.
    let topY = -Infinity
    let topRadius = 0
    const glass = shell as THREE.Mesh | null
    const position = glass?.geometry.getAttribute('position')
    if (glass && position) {
      const point = new THREE.Vector3()
      for (let index = 0; index < position.count; index += 1) {
        point.fromBufferAttribute(position, index).applyMatrix4(glass.matrixWorld)
        topY = Math.max(topY, point.y)
      }
      for (let index = 0; index < position.count; index += 1) {
        point.fromBufferAttribute(position, index).applyMatrix4(glass.matrixWorld)
        if (point.y < topY - 0.015) continue
        topRadius = Math.max(topRadius, Math.hypot(point.x, point.z))
      }
    }

    return {
      model: group,
      rim: { y: topY, radius: topRadius },
    }
  }, [gltf, materials])

  return (
    <>
      <primitive object={model} />
      {rim.radius > 0 ? (
        <mesh position={[0, rim.y - 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[rim.radius, 0.005, 10, 128]} />
          <meshPhysicalMaterial
            color="#fffdf8"
            roughness={0.02}
            metalness={0}
            transmission={0.85}
            thickness={0.05}
            ior={1.52}
            clearcoat={1}
            envMapIntensity={3}
            transparent
          />
        </mesh>
      ) : null}
    </>
  )
}

/** Fires once, after the first real frame, so the photo can hand over cleanly. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady()
  })
  return null
}

function Rig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    const targetY = state.pointer.x * 0.34 + Math.sin(time * 0.3) * 0.05
    const targetX = -state.pointer.y * 0.12
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.2, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3.2, delta)
    group.current.position.y = Math.sin(time * 0.75) * 0.025
  })

  return <group ref={group}>{children}</group>
}

export default function HeroScene({
  active = true,
  onReady,
}: {
  active?: boolean
  onReady?: () => void
}) {
  const shadow = useRadialTexture(shadowStops)

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.3, 4.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
      }}
    >
      <SceneEnvironment />
      <Halo />
      <Streaks />
      {onReady ? <ReadySignal onReady={onReady} /> : null}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.2, 4, 2.6]} intensity={2.6} color="#ffe7c9" />
      <directionalLight position={[-3, 1.6, -1.6]} intensity={1.4} color="#c87d55" />
      <directionalLight position={[0.6, 2.4, -3.4]} intensity={2.2} color="#fff1d8" />
      <spotLight
        position={[-2.4, 2.2, -2.4]}
        angle={0.7}
        penumbra={1}
        intensity={26}
        distance={12}
        color="#ffe2bd"
      />
      <pointLight position={[0.4, 1.9, 1.5]} intensity={9} distance={8} color="#d4a373" />
      <pointLight position={[-1.6, 1.2, -2.2]} intensity={12} distance={9} color="#f2c088" />

      <Suspense fallback={null}>
        <Rig>
          <Cup />
        </Rig>
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CUP_BOTTOM - 0.02, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </Canvas>
  )
}
