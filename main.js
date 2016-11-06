var amplitude = 20
  , periods = (Math.random() * 3 + 3)|0
  , period = 160 / periods
  , freq = (Math.PI * 2) / period

var pts = Array(periods*period*2|0).fill(0)

for (i = 0; i <= periods*period|0; i++) {
  if (i % (period|0) == 0) amplitude = (Math.random()*20 + 20)
  pts[2*i] = i
  pts[2*i + 1] = (amplitude * Math.cos(freq * (i + (period/2)|0)) + amplitude)
}

var paper = Snap('#melt-svg')

var pts3 = pts.slice()

var drip = paper.polyline(pts3)
drip.attr({
  fill: '#ffd200'
})
