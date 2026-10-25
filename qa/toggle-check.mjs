/**
 * Functional check for the hero stage toggle, driven over CDP.
 *
 *   node qa/toggle-check.mjs
 *
 * Captures the 3D state, clicks the stage, captures the photo state, clicks
 * again, then drives the pill with the keyboard. Prints a JSON report and
 * writes both frames next to the script.
 */
import fs from 'node:fs'
import path from 'node:path'

const port = Number(process.env.CDP_PORT || 9222)
const url = process.env.QA_URL || 'http://localhost:4317/?qa=toggle'
const outDir = process.env.QA_OUT || process.cwd()

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

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'eval failed')
  }
  return result.result.value
}

const capture = async (name) => {
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  const file = path.join(outDir, name)
  fs.writeFileSync(file, Buffer.from(shot.data, 'base64'))
  return file
}

const state = () =>
  evaluate(`(() => {
    const stage = document.querySelector('[data-hero-stage]')
    const pill = stage?.querySelector('button')
    const canvas = stage?.querySelector('canvas')
    const caption = stage?.querySelector('p')
    return {
      stage: Boolean(stage),
      canvas: Boolean(canvas),
      canvasSize: canvas ? [canvas.width, canvas.height] : null,
      caption: caption ? caption.textContent : null,
      pill: pill ? pill.textContent.trim() : null,
      pillVisible: pill ? pill.getBoundingClientRect().width > 0 : false,
      photoOpacity: [...(stage?.children ?? [])]
        .map((el) => Number(getComputedStyle(el).opacity))
        .join(','),
    }
  })()`)

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})

await send('Page.navigate', { url })
await sleep(7000)

const report = {}
report.initial = await state()
report.initial.shot = await capture('toggle-1-3d.png')

await evaluate(`document.querySelector('[data-hero-stage]').click()`)
await sleep(1400)
report.afterFirstClick = await state()
report.afterFirstClick.shot = await capture('toggle-2-photo.png')

await evaluate(`document.querySelector('[data-hero-stage]').click()`)
await sleep(2200)
report.afterSecondClick = await state()
report.afterSecondClick.shot = await capture('toggle-3-back.png')

// Keyboard: focus the pill and press Enter. It sits inside the stage, so this
// also proves the click does not bubble into a second toggle.
await evaluate(`document.querySelector('[data-hero-stage] button').focus()`)
await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 13, key: 'Enter' })
await send('Input.dispatchKeyEvent', { type: 'char', text: '\r' })
await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, key: 'Enter' })
await sleep(1400)
report.afterKeyboard = await state()
report.afterKeyboard.focused = await evaluate(
  `document.activeElement && document.activeElement.tagName`,
)

console.log(JSON.stringify(report, null, 2))
ws.close()
process.exit(0)
