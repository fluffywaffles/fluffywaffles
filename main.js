//
const listeners = {
  'drop_fall': []
}

function trigger (state_evt, args) {
  listeners[state_evt].forEach(l => l.enabled && l.fn.apply(null, args))
}

function on (state_evt, listener) {
  listeners[state_evt].push(listener)
}

//
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
var dollop_pts = []

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
    var dollop_radius = Math.random()*2 + 3
    console.log(`
      create dollop w/ radius: ${dollop_radius}
      at offset x: ${x} y: ${y}
    `)
    dollop_pts.push({ r: dollop_radius, x: x, y: y })
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
var drips = [], drops = []

console.log(`Adding each path to Paper...`)
for (let path of paths) {
  console.log(`
    new polyline: ${path}
    drips.push(...)
  `)
  var drip = paper.polyline(path)
  drip.attr({
    fill: '#ffd200',
  })
  drip.addClass('drip')
  drips.push(drip)
}
console.log(`Drips added.`)

console.log(`Adding each drop to Paper...`)
for (let drop_struct of dollop_pts) {
  let { r, x, y } = drop_struct
  let drop = paper.circle(x, y, r)
  drop.attr({
    fill: 'transparent'
  })
  drop.data('max_r', r)
  drop.addClass('drop')
  drops.push(drop)
}
console.log(`Drops added.`)

console.log(`Group drips with drops...`)
var dripdrops = []
for (let [ drip, drop ] of drips.map((d, i) => [d, drops[i]])) {
  console.log(`
    Grouping drip ${drip}
             drop ${drop}
  `)
  dripdrops.push(paper.g(drip, drop))
}
console.log(`Drip-drops grouped.`)

function randomScaleTransform () {
  return (0.7*Math.random()) + 0.65
}

function dribble (dripdrop, after) {
  let drip = dripdrop.select('.drip')
  // console.debug(`
  //   dribble drip # ${drips.indexOf(drip)}
  // `)
  let scaleY = randomScaleTransform()
  if ((scaleY - drip.data('scaleY')) < -0.1) {
    const xy = paths[drips.indexOf(drip)]
    const ix = period/2|0
    const evt_params = xy.slice(ix, ix+2).concat([ scaleY, drops[drips.indexOf(drip)] ])
    trigger('drop_fall', evt_params)
  }
  drip.data('scaleY', scaleY)
  drip.animate({
    transform: (new Snap.Matrix()).scale(1, scaleY)
  }, 1000, n => {
    return Math.log(n + 1)
  }, after)
}

on('drop_fall', {
  enabled: true,
  fn: function (x, y, scaleY, drop) {
    console.log('drop fall!!', x, scaleY*y)
    drop.attr({
      fill: '#ffd200',
      transform: (new Snap.Matrix()).scale(1, 2).translate(0, scaleY*drop.attr('cy') - 1.5*drop.attr('cy')),
      r: 0.5*drop.data('max_r')
    })
    drop.animate({
      r: drop.data('max_r'),
      transform: (new Snap.Matrix()).translate(0, 150 - drop.attr('cy')).scale(1, 1)
    }, 1000, null, _ => {
      drop.animate({
        r: 0
      }, 500)
    })
    console.log(drop)
  }
})

function perpetualDribble (dripdrop) {
  function x () {
    dribble(dripdrop, x)
  }
  dribble(dripdrop, x)
}

console.log(`Start perpetually dribbling all drips.`)
dripdrops.map((d, i) => {
  setTimeout(_ => perpetualDribble(d), i*1000/periods)
})
