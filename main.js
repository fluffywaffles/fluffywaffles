var base_amplitude = 20
  , periods = (Math.random() * 3 + 3)|0
  , period = (160 / periods)|0
  , freq = (Math.PI * 2) / period

console.log(`Syrup parameters:
    base amplitude: ${base_amplitude}
    periods:   ${periods} (varying 3 → 5 [very rarely 6])
    period:    ${period}
    freq:      ${freq}
`)

var pts = Array(periods*period*2|0).fill(0)
var dollops = Array(periods).fill(0)

console.log(`Generating cosine drips...`)
var amplitude, x, y
for (i = 0; i < periods*period|0; i++) {
  if (i % (period|0) == 0) {
    amplitude = (Math.random()*base_amplitude + base_amplitude)
    console.log(`
    Drip: ${i/period|0}
      new amplitude: ${amplitude} (varying 1x → 2x of base)
    `)
  }
  pts[2*i] = x = i
  pts[2*i + 1] = y = (amplitude * Math.cos(freq * (i + (period/2)|0)) + amplitude)
  if (i % (period|0) == (period/2|0)) {
    // "peak" (dip)
    var dollop_radius = Math.random()*2 + 4
    console.log(`
      create dollop w/ radius: ${dollop_radius}
      at offset x: ${x} y: ${y - dollop_radius}
    `)
    dollops.push({ r: dollop_radius, x: x, y: y - dollop_radius })
  }
}
console.log(`Drips generated.`)

var paths = Array(periods)
console.log(`Slicing drips into individuals...`)
for (p = 0; p < periods; p++) {
  console.log(`Slice: ${p}
    From ${2*(p*period|0)}
    To   ${2*(p*period + period|0)}
  `)
  paths[p] = pts.slice(2*(p*period|0), 2*(p*period + period|0))
}
console.log(`Drips sliced.`)

console.log(`Create the SVG using Snap.`)
var paper = Snap('#melt-svg')
var drips = []

console.log(`Adding each path to Paper...`)
for (let path of paths) {
  console.log(`
    new polyline: ${path}
    drips.push(...)
  `)
  var drip = paper.polyline(path)
  drip.attr({
    fill: '#ffd200'
  })
  drips.push(drip)
}

console.log(`Group drips using paper.group.`)
var drips_g = paper.group.apply(paper, drips)

function randomScaleTransform () {
  return 'scale(1 ' + ((0.7*Math.random()) + 0.65) + ')'
}

function dribble (drip, after) {
  console.debug(`
    dribble drip # ${drips.indexOf(drip)}
  `)
  drip.animate({
    transform: randomScaleTransform()
  }, 1000, n => {
    return Math.log(n + 1)
  }, after)
}

function perpetualDribble (drip) {
  function x () {
    dribble(drip, x)
  }
  dribble(drip, x)
}

console.log(`Start perpetually dribbling all drips.`)
drips.map((d, i) => {
  setTimeout(_ => perpetualDribble(d), i*1000/periods)
})
