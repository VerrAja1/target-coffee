const fs = require('fs')

const buf = fs.readFileSync(process.argv[2])
let offset = 12
let json
while (offset < buf.length) {
  const len = buf.readUInt32LE(offset)
  const type = buf.toString('ascii', offset + 4, offset + 8)
  const start = offset + 8
  if (type === 'JSON') json = JSON.parse(buf.toString('utf8', start, start + len))
  offset += 8 + len
}

// Minimal 4x4 matrix math (column-major, glTF order).
const mul = (a, b) => {
  const out = new Array(16).fill(0)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let sum = 0
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k]
      out[c * 4 + r] = sum
    }
  return out
}
const apply = (m, v) => [
  m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
  m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
  m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
]
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

const world = (index, parent = identity) => {
  const node = json.nodes[index]
  const local = node.matrix ? node.matrix.slice() : identity
  const m = mul(parent, local)
  const entry = { index, name: node.name, mesh: node.mesh, matrix: local, world: m }
  const children = (node.children ?? []).flatMap((child) => world(child, m))
  return [entry, ...children]
}

const all = world(0)
console.log('NODE WORLD MATRICES')
for (const entry of all) {
  if (entry.mesh === undefined) continue
  const mesh = json.meshes[entry.mesh]
  const pos = json.accessors[mesh.primitives[0].attributes.POSITION]
  const corners = []
  for (const x of [pos.min[0], pos.max[0]])
    for (const y of [pos.min[1], pos.max[1]])
      for (const z of [pos.min[2], pos.max[2]]) corners.push(apply(entry.world, [x, y, z]))
  const min = [0, 1, 2].map((i) => Math.min(...corners.map((c) => c[i])))
  const max = [0, 1, 2].map((i) => Math.max(...corners.map((c) => c[i])))
  const center = [0, 1, 2].map((i) => (min[i] + max[i]) / 2)
  const size = [0, 1, 2].map((i) => max[i] - min[i])
  console.log(
    `node ${entry.index} mesh ${entry.mesh} ${entry.name.slice(0, 8)}`,
    'world min', min.map((v) => v.toFixed(2)),
    'max', max.map((v) => v.toFixed(2)),
    'center', center.map((v) => v.toFixed(2)),
    'size', size.map((v) => v.toFixed(2)),
  )
  console.log('   local matrix', entry.matrix.map((v) => Number(v.toFixed(3))))
}
