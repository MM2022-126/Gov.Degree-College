/**
 * Admin API smoke test: login + READ all admin resources + full CRUD per resource
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const EMAIL = process.env.ADMIN_EMAIL || 'admin@college.edu.pk'
const PASSWORD = process.env.ADMIN_PASSWORD || 'your_secure_password'
const RUN_ID = `admin-api-${Date.now()}`

function log() {}

function getId(body) {
  return body?._id || body?.id || null
}

async function api(method, path, { cookie, body } = {}) {
  const headers = { Cookie: cookie }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { json = { raw: text.slice(0, 200) } }
  return { status: res.status, ok: res.ok, body: json }
}

async function crudTest(name, config, cookie) {
  const result = { page: name, create: '-', read: '-', update: '-', delete: '-', status: 'PASS', notes: '' }
  const notes = []

  try {
    // READ (list)
    if (config.listPath) {
      const r = await api('GET', config.listPath, { cookie })
      result.read = r.ok ? 'OK' : `FAIL(${r.status})`
      if (!r.ok) {
        result.status = 'FAIL'
        notes.push(`GET ${config.listPath}: ${r.status} ${JSON.stringify(r.body?.error || r.body?.raw || '')}`)
      }
    }

    // CREATE
    let id = null
    if (config.createPath && config.createBody) {
      const r = await api('POST', config.createPath, { cookie, body: config.createBody() })
      id = getId(r.body)
      result.create = r.ok && id ? 'OK' : `FAIL(${r.status})`
      if (!r.ok || !id) {
        result.status = 'FAIL'
        notes.push(`POST ${config.createPath}: ${r.status} ${JSON.stringify(r.body?.error || r.body?.raw || r.body)}`)
      }
      log('D', 'test-admin-api:create', `${name} POST`, { status: r.status, id })
    } else if (config.createPath === null) {
      result.create = 'N/A'
    }

    // UPDATE
    if (config.updatePath && config.updateBody && id) {
      const path = typeof config.updatePath === 'function' ? config.updatePath(id) : config.updatePath.replace(':id', id)
      const r = await api('PUT', path, { cookie, body: config.updateBody(id) })
      result.update = r.ok ? 'OK' : `FAIL(${r.status})`
      if (!r.ok) {
        result.status = 'FAIL'
        notes.push(`PUT ${path}: ${r.status} ${JSON.stringify(r.body?.error || r.body?.raw || '')}`)
      }
      log('D', 'test-admin-api:update', `${name} PUT`, { status: r.status, ok: r.ok })
    } else if (config.updatePath === null) {
      result.update = 'N/A'
    } else if (config.updatePath && !id) {
      result.update = 'SKIP'
    }

    // Read single item (before delete)
    if (config.readOnePath && id && result.read.startsWith('OK')) {
      const path = typeof config.readOnePath === 'function' ? config.readOnePath(id) : config.readOnePath.replace(':id', id)
      const r = await api('GET', path, { cookie })
      if (!r.ok) {
        result.read = `FAIL(${r.status})`
        result.status = 'FAIL'
        notes.push(`GET ${path}: ${r.status}`)
      }
    }

    // DELETE
    if (config.deletePath && id) {
      const path = typeof config.deletePath === 'function' ? config.deletePath(id) : config.deletePath.replace(':id', id)
      const r = await api('DELETE', path, { cookie })
      result.delete = r.ok ? 'OK' : `FAIL(${r.status})`
      if (!r.ok) {
        result.status = 'FAIL'
        notes.push(`DELETE ${path}: ${r.status} ${JSON.stringify(r.body?.error || r.body?.raw || '')}`)
      }
      log('D', 'test-admin-api:delete', `${name} DELETE`, { status: r.status, ok: r.ok })
    } else if (config.deletePath === null) {
      result.delete = 'N/A'
    } else if (config.deletePath && !id) {
      result.delete = 'SKIP'
    }
  } catch (e) {
    result.status = 'FAIL'
    notes.push(e.message)
    log('A', 'test-admin-api:crud', `${name} error`, { error: e.message })
  }

  result.notes = notes.join('; ')
  return result
}

const RESOURCES = [
  {
    name: 'Dashboard',
    listPath: '/api/admin/dashboard-stats',
    createPath: null,
    updatePath: null,
    deletePath: null,
  },
  {
    name: 'News',
    listPath: '/api/news',
    createPath: '/api/news',
    createBody: () => ({
      title: `Test News ${RUN_ID}`,
      excerpt: 'Auto test excerpt',
      category: 'Academic',
      isPublished: true,
    }),
    updatePath: (id) => `/api/news/${id}`,
    updateBody: () => ({ title: `Test News Updated ${RUN_ID}`, excerpt: 'Updated excerpt', category: 'Academic' }),
    deletePath: (id) => `/api/news/${id}`,
    readOnePath: (id) => `/api/news/${id}`,
  },
  {
    name: 'Events',
    listPath: '/api/events',
    createPath: '/api/events',
    createBody: () => ({
      title: `Test Event ${RUN_ID}`,
      slug: `test-event-${RUN_ID}`,
      eventDate: new Date('2026-08-01').toISOString(),
      shortDescription: 'Auto test event',
      isPublished: true,
    }),
    updatePath: (id) => `/api/events/${id}`,
    updateBody: () => ({ title: `Test Event Updated ${RUN_ID}`, shortDescription: 'Updated' }),
    deletePath: (id) => `/api/events/${id}`,
    readOnePath: (id) => `/api/events/${id}`,
  },
  {
    name: 'Faculty',
    listPath: '/api/faculty',
    createPath: '/api/faculty',
    createBody: () => ({
      name: `Test Faculty ${RUN_ID}`,
      title: 'Professor',
      dept: 'Computer Science',
    }),
    updatePath: (id) => `/api/faculty/${id}`,
    updateBody: () => ({ name: `Test Faculty Updated ${RUN_ID}`, title: 'Associate Professor', dept: 'Computer Science' }),
    deletePath: (id) => `/api/faculty/${id}`,
  },
  {
    name: 'Principals',
    listPath: '/api/principals',
    createPath: '/api/principals',
    createBody: () => ({
      name: `Test Principal ${RUN_ID}`,
      tenure: '2020 – Present',
      description: 'Auto test',
      role: 'principal',
    }),
    updatePath: (id) => `/api/principals/${id}`,
    updateBody: () => ({ name: `Test Principal Updated ${RUN_ID}`, tenure: '2020 – Present', description: 'Updated' }),
    deletePath: (id) => `/api/principals/${id}`,
  },
  {
    name: 'Announcements',
    listPath: '/api/announcements',
    createPath: '/api/announcements',
    createBody: () => ({ title: `Test Announcement ${RUN_ID}`, content: 'Auto test', active: true }),
    updatePath: (id) => `/api/announcements/${id}`,
    updateBody: () => ({ title: `Test Announcement Updated ${RUN_ID}`, content: 'Updated', active: true }),
    deletePath: (id) => `/api/announcements/${id}`,
  },
  {
    name: 'Departments',
    listPath: '/api/departments',
    createPath: '/api/departments',
    createBody: () => ({
      name: `Test Dept ${RUN_ID}`,
      description: 'Auto test department',
      display_order: 99,
    }),
    updatePath: (id) => `/api/departments/${id}`,
    updateBody: () => ({ name: `Test Dept Updated ${RUN_ID}`, description: 'Updated' }),
    deletePath: (id) => `/api/departments/${id}`,
  },
  {
    name: 'Schedule',
    listPath: '/api/schedule',
    createPath: '/api/schedule',
    createBody: () => ({
      subject: `Test Subject ${RUN_ID}`,
      date: '2026-08-15',
      time: '10:00 AM',
      venue: 'Room 101',
    }),
    updatePath: (id) => `/api/schedule/${id}`,
    updateBody: () => ({ subject: `Test Subject Updated ${RUN_ID}`, date: '2026-08-15', time: '11:00 AM', venue: 'Room 102' }),
    deletePath: (id) => `/api/schedule/${id}`,
  },
  {
    name: 'Media',
    listPath: '/api/media',
    createPath: '/api/media',
    createBody: () => ({
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      publicId: `test-media-${RUN_ID}`,
      altText: 'Test media',
      category: 'other',
    }),
    updatePath: (id) => `/api/media/${id}`,
    updateBody: () => ({ altText: 'Updated alt text' }),
    deletePath: (id) => `/api/media/${id}`,
  },
  {
    name: 'Settings',
    listPath: '/api/settings',
    createPath: '/api/settings',
    createBody: () => ({ key: `test_setting_${RUN_ID}`, value: 'test_value' }),
    updatePath: null,
    deletePath: `/api/settings/test_setting_${RUN_ID}`,
  },
  {
    name: 'Chat',
    listPath: '/api/chat-messages/all',
    createPath: '/api/chat-messages',
    createBody: () => ({
      sessionId: `test-session-${RUN_ID}`,
      sender: 'user',
      text: 'Hello from smoke test',
      name: 'Test User',
    }),
    updatePath: null,
    deletePath: null,
  },
]

async function main() {
  console.log(`\n=== Admin API CRUD Smoke Test ===`)
  console.log(`BASE: ${BASE}  RUN_ID: ${RUN_ID}\n`)

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const loginBody = await loginRes.json().catch(() => ({}))
  log('B', 'test-admin-api:login', 'login otp request', { status: loginRes.status, requiresOtp: !!loginBody.requiresOtp })
  if (!loginRes.ok || !loginBody.requiresOtp) {
    console.error('Login OTP request failed:', loginBody)
    process.exit(1)
  }
  const otp = loginBody.devOtp
  if (!otp) {
    console.error('No devOtp returned. Configure SMTP or run in development without SMTP so the smoke test can read the code.')
    process.exit(1)
  }
  const verifyRes = await fetch(`${BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, otp }),
  })
  const setCookie = verifyRes.headers.get('set-cookie') || ''
  const tokenMatch = setCookie.match(/admin_token=([^;]+)/)
  log('B', 'test-admin-api:verify-otp', 'verify', { status: verifyRes.status, hasCookie: !!tokenMatch })
  if (!tokenMatch) {
    const body = await verifyRes.text()
    console.error('OTP verify failed:', body)
    process.exit(1)
  }
  const cookie = `admin_token=${tokenMatch[1]}`
  console.log('Login (OTP): OK\n')

  const results = []
  for (const resource of RESOURCES) {
    const r = await crudTest(resource.name, resource, cookie)
    results.push(r)
    console.log(`${r.status === 'PASS' ? '✓' : '✗'} ${r.page}: C=${r.create} R=${r.read} U=${r.update} D=${r.delete}${r.notes ? ` — ${r.notes}` : ''}`)
  }

  // Chat stats (read-only extra)
  const chatStats = await api('GET', '/api/chat/stats', { cookie })
  console.log(`  Chat stats: ${chatStats.ok ? 'OK' : `FAIL(${chatStats.status})`}`)

  // Settings PUT test
  const settingsKey = `test_setting_put_${RUN_ID}`
  await api('POST', '/api/settings', { cookie, body: { key: settingsKey, value: 'v1' } })
  const settingsPut = await api('PUT', `/api/settings/${settingsKey}`, { cookie, body: { value: 'v2' } })
  await api('DELETE', `/api/settings/${settingsKey}`, { cookie })
  const settingsRow = results.find((r) => r.page === 'Settings')
  if (settingsRow) {
    settingsRow.update = settingsPut.ok ? 'OK' : `FAIL(${settingsPut.status})`
    if (!settingsPut.ok) {
      settingsRow.status = 'FAIL'
      settingsRow.notes += (settingsRow.notes ? '; ' : '') + `PUT settings: ${settingsPut.status}`
    }
  }

  console.log('\n=== SUMMARY TABLE ===')
  console.log('Page'.padEnd(16) + 'Create'.padEnd(8) + 'Read'.padEnd(8) + 'Update'.padEnd(8) + 'Delete'.padEnd(8) + 'Status')
  console.log('-'.repeat(56))
  for (const r of results) {
    console.log(
      r.page.padEnd(16) +
      String(r.create).padEnd(8) +
      String(r.read).padEnd(8) +
      String(r.update).padEnd(8) +
      String(r.delete).padEnd(8) +
      r.status
    )
  }

  const failed = results.filter((r) => r.status === 'FAIL')
  if (failed.length) {
    console.log('\n=== FAILURES ===')
    for (const f of failed) console.log(`  ${f.page}: ${f.notes}`)
    process.exit(1)
  }
  console.log('\nAll tests passed.')
}

main().catch((e) => {
  log('A', 'test-admin-api', 'fatal', { error: e.message })
  console.error(e)
  process.exit(1)
})
