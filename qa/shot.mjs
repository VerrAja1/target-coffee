/**
 * Screenshot helper for QA that does not need a foreground window.
 *
 *   node qa/shot.mjs --url http://localhost:4317/ --out shot.png --w 1440 --h 900
 *
 * Extra flags:
 *   --wait 2500      ms to wait after load before capturing
 *   --eval "js"      run in the page before capturing (can be repeated)
 *   --scroll 2600    scroll the page before capturing
 *   --lang en        set the persisted language before loading
 *
 * It drives a Chrome started with --remote-debugging-port=9222.
 */
import fs from 'node:fs'

const args = process.argv.slice(2)
const read = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const readAll = (name) => {
  const out = []
  args.forEach((arg, index) => {
    if (arg === `--${name}`) out.push(args[index + 1])
  })
  return out
}

const port = Number(read('port', 9222))
const url = read('url', 'http://localhost:4317/')
const out = read('out', 'shot.png')
const width = Number(read('w', 1440))
const height = Number(read('h', 900))
const wait = Number(read('wait', 2200))
const scroll = read('scroll', null)
const lang = read('lang', null)
const scripts = readAll('eval')
const clickSel = read('click', null)
const dpr = Number(read('dpr', 1))

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = list.find((entry) => entry.type === 'page')
if (!page) throw new Error('no page target')

const ws = new WebSocket(page.webSocketDebuggerUrl)
let nextId = 0
const pending = new Map()

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  }
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: dpr,
  mobile: false,
})

if (lang) {
  await send('Page.navigate', { url: url.split('?')[0] })
  await sleep(600)
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('target-coffee-lang', ${JSON.stringify(lang)})`,
  })
}

await send('Page.navigate', { url })
await sleep(wait)

if (scroll !== null) {
  await send('Runtime.evaluate', {
    expression: `document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0, ${Number(scroll)});`,
  })
  await sleep(900)
}

for (const script of scripts) {
  await send('Runtime.evaluate', { expression: script, awaitPromise: true })
  await sleep(400)
}

if (clickSel) {
  await send('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(clickSel)}).click()`,
  })
  await sleep(900)
}

const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'))
console.log(out, fs.statSync(out).size)
ws.close()
process.exit(0)
