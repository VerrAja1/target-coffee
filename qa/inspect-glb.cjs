const fs = require('fs')

const file = process.argv[2]
const buf = fs.readFileSync(file)
const magic = buf.toString('ascii', 0, 4)
const version = buf.readUInt32LE(4)
const total = buf.readUInt32LE(8)
console.log('header', magic, 'v' + version, 'bytes', total)

let offset = 12
const chunks = []
while (offset < buf.length) {
  const len = buf.readUInt32LE(offset)
  const type = buf.toString('ascii', offset + 4, offset + 8)
  chunks.push({ type, len, start: offset + 8 })
  offset += 8 + len
}
console.log('chunks', chunks.map((c) => c.type + ':' + c.len).join(' '))

const jsonChunk = chunks.find((c) => c.type === 'JSON')
const json = JSON.parse(buf.toString('utf8', jsonChunk.start, jsonChunk.start + jsonChunk.len))

console.log('\nasset', json.asset)
console.log('extensionsUsed', json.extensionsUsed)
console.log('counts', {
  scenes: json.scenes?.length,
  nodes: json.nodes?.length,
  meshes: json.meshes?.length,
  materials: json.materials?.length,
  textures: json.textures?.length,
  images: json.images?.length,
  accessors: json.accessors?.length,
  animations: json.animations?.length,
  skins: json.skins?.length,
})

console.log('\nSCENES')
json.scenes?.forEach((s, i) => console.log(i, JSON.stringify({ name: s.name, roots: s.nodes })))

console.log('\nNODES')
json.nodes?.forEach((n, i) => {
  console.log(
    i,
    JSON.stringify({
      name: n.name,
      mesh: n.mesh,
      children: n.children,
      t: n.translation,
      r: n.rotation,
      s: n.scale,
      matrix: n.matrix ? 'yes' : undefined,
    }),
  )
})

console.log('\nMESHES')
json.meshes?.forEach((m, i) => {
  console.log(
    i,
    JSON.stringify({
      name: m.name,
      prims: m.primitives.map((p) => ({
        mat: p.material,
        mode: p.mode,
        attrs: Object.keys(p.attributes),
        count: json.accessors[p.attributes.POSITION]?.count,
        min: json.accessors[p.attributes.POSITION]?.min,
        max: json.accessors[p.attributes.POSITION]?.max,
        indices: p.indices !== undefined ? json.accessors[p.indices]?.count : undefined,
      })),
    }),
  )
})

console.log('\nMATERIALS')
json.materials?.forEach((m, i) => {
  console.log(i, JSON.stringify({ name: m.name, pbr: m.pbrMetallicRoughness, ext: m.extensions, alphaMode: m.alphaMode, doubleSided: m.doubleSided }))
})

console.log('\nIMAGES')
json.images?.forEach((im, i) => {
  const bv = im.bufferView !== undefined ? json.bufferViews[im.bufferView] : null
  console.log(i, JSON.stringify({ name: im.name, mime: im.mimeType, uri: im.uri, bytes: bv?.byteLength }))
})

console.log('\nTEXTURES')
json.textures?.forEach((t, i) => console.log(i, JSON.stringify(t)))

console.log('\nACCESSOR BYTES')
let accBytes = 0
json.accessors?.forEach((a) => {
  const bv = json.bufferViews[a.bufferView]
  if (bv) accBytes += bv.byteLength
})
console.log('geometry+other bufferViews', accBytes)
