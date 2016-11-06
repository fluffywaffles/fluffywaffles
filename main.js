var amplitude = 20
  , periods = (Math.random() * 3 + 3)|0
  , period = 160 / periods
  , freq = (Math.PI * 2) / period

var pts = Array(periods*period*2|0).fill(0)

for (i = 0; i < periods*period|0; i++) {
  if (i % (period|0) == 0) amplitude = (Math.random()*20 + 20)
  pts[2*i] = i
  pts[2*i + 1] = (amplitude * Math.cos(freq * (i + (period/2)|0)) + amplitude)
}

var paths = Array(periods)
for (p = 0; p < periods; p++) {
  // console.log(`
  //   From ${2*(p*period|0)}
  //   To   ${2*(p*period + period|0)}
  // `)
  paths[p] = pts.slice(2*(p*period|0), 2*(p*period + period|0))
}

var paper = Snap('#melt-svg')
var drips = []

for (let path of paths) {
  var drip = paper.polyline(path)
  drip.attr({
    fill: '#ffd200'
  })
  drips.push(drip)
}

drips[0].animate({
  transform: randomScaleTransform()
}, 1000)

var drips_g = paper.group.apply(paper, drips)

function randomScaleTransform () {
  return 'scale(1 ' + ((Math.random()/2) + 0.5) + ')'
}

function dribble (drip, after) {
  drip.animate({
    transform: randomScaleTransform()
  }, 1000, mina.easeinout, after)
}

function perpetualDribble (drip) {
  function x () {
    dribble(drip, x)
  }
  dribble(drip, x)
}

drips.map(perpetualDribble)
