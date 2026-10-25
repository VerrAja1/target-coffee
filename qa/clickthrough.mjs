/**
 * Click-through evidence for the delivery gate, driven over CDP.
 *
 *   node qa/clickthrough.mjs
 *
 * Walks the interactive surface at desktop and mobile width and prints a JSON
 * report. Nothing here is a screenshot: every step reads the DOM before and
 * after the action, so a PASS means the behaviour actually happened.
 */
const port = Number(process.env.CDP_PORT || 9222)
const base = process.env.QA_URL || 'http://localhost:4317/'

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = list.find((entry) => entry.type === 'page')
if (!page) throw new Error('no page target')

const ws = new WebSocket(page.webSocketDebuggerUrl)
let nextId = 0
const pending = new Map()
const consoleErrors = []

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
    return
  }
  if (message.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(message.params.exceptionDetails.text)
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '))
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

const key = async (windowsVirtualKeyCode, k) => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode, key: k })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode, key: k })
}

await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})

await send('Page.enable')
await send('Runtime.enable')

const load = async (width, height) => {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 640,
  })
  await send('Page.navigate', { url: base })
  await sleep(4200)
}

const report = {}

// Desktop ---------------------------------------------------------------
await load(1440, 900)

report.console = { count: consoleErrors.length, messages: consoleErrors.slice(0, 8) }

report.nav = await evaluate(`(() => {
  const links = [...document.querySelectorAll('header nav a[href^="#"]')]
  return {
    count: links.length,
    items: links.map((a) => ({ href: a.getAttribute('href'), exists: Boolean(document.querySelector(a.getAttribute('href'))) })),
  }
})()`)

report.language = await evaluate(`(async () => {
  const button = [...document.querySelectorAll('header button[aria-label]')].find((b) => b.getAttribute('aria-label').startsWith('Ganti bahasa'))
  const before = {
    lang: document.documentElement.lang,
    menu: document.querySelector('#menu-title').textContent,
  }
  button.click()
  await new Promise((r) => setTimeout(r, 250))
  const english = {
    lang: document.documentElement.lang,
    menu: document.querySelector('#menu-title').textContent,
    stored: localStorage.getItem('target-coffee-lang'),
  }
  const back = [...document.querySelectorAll('header button[aria-label]')].find((b) => b.getAttribute('aria-label').startsWith('Change language'))
  back.click()
  await new Promise((r) => setTimeout(r, 250))
  return {
    before,
    english,
    back: { lang: document.documentElement.lang, menu: document.querySelector('#menu-title').textContent },
  }
})()`)

report.order = await evaluate(`(async () => {
  const buttons = [...document.querySelectorAll('#menu button')].filter((b) => b.textContent.trim().startsWith('Tambah'))
  if (buttons.length === 0) return { added: false }
  buttons[0].click()
  await new Promise((r) => setTimeout(r, 400))
  let customizer = document.querySelector('dialog[open]')
  if (customizer) {
    const confirm = [...customizer.querySelectorAll('button')].find((b) => /tambah|pesanan|add/i.test(b.textContent))
    if (confirm) confirm.click()
    await new Promise((r) => setTimeout(r, 400))
  }
  const cart = document.querySelector('header button[aria-expanded]')
  const label = cart.getAttribute('aria-label')
  cart.click()
  await new Promise((r) => setTimeout(r, 500))
  const dialog = document.querySelector('dialog[open]')
  const rows = dialog ? [...dialog.querySelectorAll('dd')].map((dd) => dd.textContent.trim()) : []
  const values = rows.map((text) => Number(text.replace(/[^0-9]/g, ''))).filter((n) => Number.isFinite(n) && n > 0)
  return { added: true, customizerOpened: Boolean(customizer), cartLabel: label, drawerOpen: Boolean(dialog), rows, values }
})()`)

if (report.order.rows?.length >= 4) {
  const [subtotal, service, tax, total] = report.order.values.slice(-4)
  report.order.math = {
    subtotal,
    service,
    tax,
    total,
    serviceOk: service === Math.round(subtotal * 0.05),
    taxOk: tax === Math.round((subtotal + service) * 0.1),
    totalOk: total === subtotal + service + tax,
  }
}

await key(27, 'Escape')
await sleep(500)
report.order.escapeCloses = await evaluate(`!document.querySelector('dialog[open]')`)

report.booking = await evaluate(`(async () => {
  const submit = document.querySelector('#booking button[type="submit"]')
  submit.click()
  await new Promise((r) => setTimeout(r, 400))
  const errors = [...document.querySelectorAll('#booking [id$="-error"]')].map((el) => el.id)
  return { errorsShown: errors.length, ids: errors }
})()`)

report.whatsapp = await evaluate(`(() => {
  const links = [...document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]')]
  return { count: links.length, hrefs: [...new Set(links.map((a) => a.getAttribute('href')))].slice(0, 4) }
})()`)

report.desktopOverflow = await evaluate(
  `document.documentElement.scrollWidth <= window.innerWidth + 1`,
)

// Mobile ---------------------------------------------------------------
await load(390, 844)

report.mobile = await evaluate(`(async () => {
  const open = document.querySelector('header button[aria-label="Buka navigasi"]')
  open.click()
  await new Promise((r) => setTimeout(r, 500))
  const opened = Boolean(document.querySelector('dialog[open]'))
  const links = [...document.querySelectorAll('dialog[open] nav a')].map((a) => a.getAttribute('href'))
  document.querySelector('dialog[open]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  return { opened, links, width: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth + 1 }
})()`)

await key(27, 'Escape')
await sleep(600)
report.mobile.escapeCloses = await evaluate(`!document.querySelector('dialog[open]')`)

console.log(JSON.stringify(report, null, 2))
ws.close()
process.exit(0)
