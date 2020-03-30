const prettyBytes = require('prettier-bytes')
const jsonParse = require('fast-json-parse')
const prettyMs = require('pretty-ms')
const chalk = require('chalk')
const nl = '\n'

const emojiLog = {
  warn: '⚠️',
  info: '✨',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🔍'
}

function isWideEmoji (character) {
  return character !== '⚠️'
}

function isObject (input) {
  return Object.prototype.toString.apply(input) === '[object Object]'
}

function isPinoLog (log) {
  return log && ('v' in log && log.v === 1)
}

function parse (inputData) {
  let obj
  if (typeof inputData === 'string') {
    const parsedData = jsonParse(inputData)
    if (!parsedData.value || parsedData.err || !isPinoLog(parsedData.value)) {
      return inputData + nl
    }
    obj = parsedData.value
  } else if (isObject(inputData) && isPinoLog(inputData)) {
    obj = inputData
  } else {
    return inputData + nl
  }

  if (!obj.level) return inputData + nl
  if (!obj.message) obj.message = obj.msg
  if (typeof obj.level === 'number') convertLogNumber(obj)

  return output(obj) + nl
}

function convertLogNumber (obj) {
  if (obj.level === 10) obj.level = 'trace'
  if (obj.level === 20) obj.level = 'debug'
  if (obj.level === 30) obj.level = 'info'
  if (obj.level === 40) obj.level = 'warn'
  if (obj.level === 50) obj.level = 'error'
  if (obj.level === 60) obj.level = 'fatal'
}

function output (obj) {
  const output = []

  if (!obj.level) obj.level = 'userlvl'
  if (!obj.name) obj.name = ''
  if (!obj.ns) obj.ns = ''

  output.push(formatDate())
  output.push(formatLevel(obj.level))
  output.push(formatNs(obj.ns))
  output.push(formatName(obj.name))
  output.push(formatMessage(obj))

  const req = obj.req
  const res = obj.res
  const statusCode = (res) ? res.statusCode : obj.statusCode
  const responseTime = obj.responseTime || obj.elapsed
  const method = (req) ? req.method : obj.method
  const contentLength = obj.contentLength || (res && res.headers && res.headers['content-length'])
  const operationName = obj.graphqlRequest && obj.graphqlRequest.operationName
  const graphqlResponse = obj.graphqlResponse
  const url = (req) ? req.url : obj.url
  const stack = (obj.level === 'fatal' || obj.level === 'error')
    ? obj.stack || (obj.err && obj.err.stack)
    : null

  if (obj.ns === 'graphql') {
    if (obj.message === 'request') output.push(formatOperationName(operationName))
    if (obj.message === 'response') output.push(formatResult(graphqlResponse))
  } else if (method != null) {
    output.push(formatMethod(method))
    output.push(formatStatusCode(statusCode))
  }
  if (url != null) output.push(formatUrl(url))
  if (contentLength != null) output.push(formatBundleSize(contentLength))
  if (responseTime != null) output.push(formatLoadTime(responseTime))
  if (stack != null) output.push(formatStack(stack))

  return output.filter(noEmpty).join(' ')
}

function formatDate () {
  const date = new Date()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const prettyDate = hours + ':' + minutes + ':' + seconds
  return chalk.gray(prettyDate)
}

function formatOperationName (opName) {
  return chalk.white(opName || '???')
}

function formatResult (graphqlResponse) {
  if (graphqlResponse.errors) {
    const errorCodes = graphqlResponse.errors
      .map(e => e.extensions && e.extensions.code)
      .filter(Boolean)
    return chalk.red(errorCodes.join(', '))
  }
  return chalk.white('ok')
}

function formatLevel (level) {
  const emoji = emojiLog[level]
  const padding = isWideEmoji(emoji) ? '' : ' '
  return emoji + padding
}

function formatNs (name) {
  return chalk.cyan(name)
}

function formatName (name) {
  return chalk.blue(name)
}

function formatMessage (obj) {
  const msg = formatMessageName(obj.message)
  let pretty
  if (obj.level === 'error') pretty = chalk.red(msg)
  if (obj.level === 'trace') pretty = chalk.white(msg)
  if (obj.level === 'warn') pretty = chalk.magenta(msg)
  if (obj.level === 'debug') pretty = chalk.yellow(msg)
  if (obj.level === 'info' || obj.level === 'userlvl') pretty = chalk.green(msg)
  if (obj.level === 'fatal') pretty = chalk.white.bgRed(msg)
  return pretty
}

function formatUrl (url) {
  return chalk.white(url)
}

function formatMethod (method) {
  return chalk.white(method)
}

function formatStatusCode (statusCode) {
  statusCode = statusCode || 'xxx'
  return chalk.white(statusCode)
}

function formatLoadTime (elapsedTime) {
  const elapsed = parseInt(elapsedTime, 10)
  const time = prettyMs(elapsed)
  return chalk.gray(time)
}

function formatBundleSize (bundle) {
  const bytes = parseInt(bundle, 10)
  const size = prettyBytes(bytes).replace(/ /, '')
  return chalk.gray(size)
}

function formatMessageName (message) {
  if (message === 'request') return '<--'
  if (message === 'response') return '-->'
  return message
}

function formatStack (stack) {
  return stack ? nl + stack : ''
}

function noEmpty (val) {
  return !!val
}

module.exports = function PinoColada () {
  return parse
}
