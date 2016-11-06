var period = 30
  , freq = (Math.PI * 2) / period
  , amplitude = 20
  , periods = (150 / period)|0 + 1

var pts = Array(periods*period*2|0).fill(0)

var offset = (window.innerWidth - 150) >> 1

for (i = 0; i <= periods*period|0; i++) {
  if (i % (period|0) == 0) amplitude = (Math.random()*20 + 20)
  pts[2*i] = offset + i
  pts[2*i + 1] = (window.innerHeight/2) + (amplitude * Math.cos(freq * (i + (period/2)|0)) + amplitude)
}

var paper = Snap('#melt-svg')

var pts3 = pts.slice()

var drip = paper.polyline(pts3)
drip.attr({
  fill: '#ffd200'
})
