const staticMeta = {}

const levels = {
  3: 'error',
  4: 'warning',
  6: 'info',
}

const colors = {
  reset: '\x1b[0m',
  3: '\x1b[0;31m',
  4: '\x1b[0;33m',
  6: '',
}

function formatForJson(entry) {
  return JSON.stringify(entry)
}

function formatForConsole(entry) {
  const excluded = ['message', 'level', 'extra', 'loggerName', 'owner']
  const properties = Object.entries(Object.assign(entry, entry.extra))
    .filter(([key]) => !excluded.some(x => key === x))
    .map(([key, value]) => `${key}=${value}`)
    .reduce((a, i) => { a.push(i); return a }, [])
    .join(', ')

  const color = colors[entry.level]
  const levelName = levels[entry.level]
  const propsString = properties ? `{ ${properties} }` : ''

  return `${color}[${levelName}] ${entry.message} ${propsString}${colors.reset}`
}

let formatter = formatForJson

function log(level, message, properties) {
  const props = properties || {}
  const entry = Object.assign({ message, level }, staticMeta, props)

  const stream = level <= 3 ? process.stderr : process.stdout
  const line = formatter(entry)

  stream.write(`${line}\n`)
}

function error(message, err, extra) {
  log(3, message, { errorMessage: err.message, stackTrace: err.stack, extra: extra })
}

function warning(message, extra) {
  log(4, message, { extra })
}

function info(message, extra) {
  log(6, message, { extra })
}

const settings = {
  logAsJson: () => {
    formatter = formatForJson
  },
  logAsText: () => {
    formatter = formatForConsole
  },
  addPackageJsonFields: (packageJson) => {
    const { name: loggerName, author: { name: owner } } = packageJson
    staticMeta.loggerName = loggerName
    staticMeta.owner = owner
  },
}

module.exports = {
  settings,
  error,
  warning,
  info,
}
