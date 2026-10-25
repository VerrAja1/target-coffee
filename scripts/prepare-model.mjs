/**
 * Turns the supplied 3D export into the single glass the hero needs.
 *
 *   pnpm prepare:model "C:/Users/you/Downloads/relebook.com_ggach834284.glb"
 *
 * The source file (19.6 MB) packs three cups in a row along X, each one exported
 * as two mesh nodes: the glass shell and the drink inside it. This script keeps
 * the pair whose bounding box is centred on the origin, recentres it, then drops
 * the texture to WebP 1024 and simplifies the geometry. Output: 284 KB with
 * 7,968 vertices, quantized, which is what `public/models/glass-cup.glb` ships.
 *
 * The tools are dev-only: @gltf-transform/* and meshoptimizer are not part of
 * the runtime bundle (see package.json devDependencies).
 */
import fs from 'node:fs'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import {
  dedup,
  prune,
  quantize,
  simplify,
  weld,
} from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const input = process.argv[2]
const output = process.argv[3] ?? 'public/models/glass-cup.glb'

if (!input) {
  console.error('usage: node scripts/prepare-model.mjs <input.glb> [output.glb]')
  process.exit(1)
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const doc = await io.read(input)
const root = doc.getRoot()
const scene = root.listScenes()[0]

console.log('in ', fs.statSync(input).size, 'bytes')

const applyMatrix = (m, v) => [
  m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
  m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
  m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
]

// --- 1. Keep only the middle cup -------------------------------------------
// Two meshes share a cup: shell and drink. Group by rounded world centre X and
// keep whichever group sits closest to zero.
const meshNodes = []
for (const node of scene.listChildren()) {
  node.traverse((child) => {
    const mesh = child.getMesh()
    if (!mesh) return
    const position = mesh.listPrimitives()[0].getAttribute('POSITION')
    const min = position.getMin([])
    const max = position.getMax([])
    const corners = []
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          corners.push(applyMatrix(child.getWorldMatrix(), [x, y, z]))
        }
    const center = [0, 1, 2].map(
      (i) => corners.reduce((sum, corner) => sum + corner[i], 0) / corners.length,
    )
    meshNodes.push({ node: child, center })
  })
}

const groups = new Map()
for (const entry of meshNodes) {
  const key = entry.center[0].toFixed(2)
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(entry)
}

const middleKey = [...groups.keys()].sort((a, b) => Math.abs(a) - Math.abs(b))[0]
const keep = new Set(
  groups.get(middleKey).map((entry) => entry.node),
)
console.log(
  'groups',
  [...groups].map(([key, value]) => `${key}:${value.length} nodes`),
  '-> keep x',
  middleKey,
)

for (const entry of meshNodes) {
  if (keep.has(entry.node)) continue
  entry.node.dispose()
}

// --- 2. Centre the remaining cup on the origin ------------------------------
// The export carries FBX transform matrices on every level; after dropping two
// cups those transforms only get in the way.
root.listNodes().forEach((node) => {
  if (node.getMesh()) return
  const identity = new Array(16).fill(0)
  identity[0] = 1
  identity[5] = 1
  identity[10] = 1
  identity[15] = 1
  node.setMatrix(identity)
})

const kept = [...keep]
let min = [Infinity, Infinity, Infinity]
let max = [-Infinity, -Infinity, -Infinity]
for (const node of kept) {
  const position = node.getMesh().listPrimitives()[0].getAttribute('POSITION')
  const pmin = position.getMin([])
  const pmax = position.getMax([])
  for (const x of [pmin[0], pmax[0]])
    for (const y of [pmin[1], pmax[1]])
      for (const z of [pmin[2], pmax[2]]) {
        const point = applyMatrix(node.getWorldMatrix(), [x, y, z])
        min = min.map((value, index) => Math.min(value, point[index]))
        max = max.map((value, index) => Math.max(value, point[index]))
      }
}

const center = min.map((value, index) => (value + max[index]) / 2)
console.log(
  'bbox',
  min.map((value) => Number(value.toFixed(2))),
  max.map((value) => Number(value.toFixed(2))),
)

for (const node of kept) {
  const translation = node.getTranslation()
  node.setTranslation([
    translation[0] - center[0],
    translation[1] - center[1],
    translation[2] - center[2],
  ])
}

// --- 3. Shrink geometry and texture ----------------------------------------
// The texture is re-encoded directly with sharp instead of `textureCompress`,
// because that helper reaches into sharp internals and breaks on newer libvips.
for (const texture of root.listTextures()) {
  const image = texture.getImage()
  if (!image) continue
  const buffer = Buffer.from(image)
  const webp = await sharp(buffer)
    .toColourspace('srgb')
    .resize(1024, 1024, { fit: 'inside' })
    .webp({ quality: 82 })
    .toBuffer()
  texture.setImage(webp).setMimeType('image/webp')
}

await MeshoptSimplifier.ready
await doc.transform(
  prune(),
  weld(),
  dedup(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.32, error: 0.0008 }),
  prune(),
)
await doc.transform(quantize())

fs.mkdirSync(path.dirname(output), { recursive: true })
await io.write(output, doc)

const vertices = root
  .listMeshes()
  .flatMap((mesh) => mesh.listPrimitives())
  .map((primitive) => primitive.getAttribute('POSITION').getCount())

console.log('out', fs.statSync(output).size, 'bytes, vertices', vertices)
