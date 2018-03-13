module.exports.start = (label) => {
  if (process.env.TIMING === 'true') {
    return console.time(label)
  }
  // Noop
}

module.exports.end = (label) => {
  if (process.env.TIMING === 'true') {
    return console.timeEnd(label)
  }
  // Noop
}
