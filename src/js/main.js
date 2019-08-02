// Events.
function trigger (state_evt, args, listeners) {
  listeners[state_evt].forEach(l => l.fn.apply(null, args))
}

function on (state_evt, listener, listeners) {
  listeners[state_evt].push(listener)
  return listeners.length-1
}

function off (state_evt, index, listeners) {
  listeners.splice(index, 1)
}

function kill (state_evt, listeners) {
  listeners[state_evt].length = 0
}

/* "Button" links. Using an <a> to make things clickable.
 * Why not use <button>?
 *
 * 1. It renders weird. (Sorry, but it does.)
 * 2. This is a very special case of a button. I want a link, as in:
 *    "clicking this will [eventually] result in linking to another page."
 * 3. I want these to populate on the page as "links" for the purpose of
 *    keyboard-assisted navigation. (TODO: make their aria-role button.)
 */
const button_links = document.querySelectorAll('a[data-button-link]')
button_links.forEach(button_link => {
  if (button_link.innerText.length === 0) {
    console.log(`
      a[data-button-link]: found one of those naughty stray links that
      Webkit likes to materialize inside of <ul>s! Deleting it.

      Stupid, stupid Webkit. Go have a beer with somebody who cares about
      HTML semantics and give it a good cry. I want my code to work.

      Webkit: "The web is broken; it's not my fault!"
      Somebody who cares: "There, there, Webkit."
    `)
    button_link.remove()
  }
  button_link.addEventListener('click', event => {
    event.preventDefault()
    event.target.parentElement.click()
  })
})

// Collapsible tree effect.
const trees = document.querySelectorAll(`ul.collapsible-tree`)
trees.forEach(tree => {
  console.log('Collapsible Tree: setting up', tree)
  const items = tree.querySelectorAll('li')
  const subtrees = [].filter.call(items, item => item.querySelectorAll('ul').length > 0)
  ;[].forEach.call(subtrees, subtree => {
    console.log('Collapsible Tree: setting click handler for subtree', subtree)
    function close (event) {
      subtree.classList.remove('open')
      document.body.removeEventListener('click', close)
    }
    subtree.addEventListener('click', event => {
      event.stopPropagation()
      if (event.target === subtree) {
        subtree.classList.toggle('open')
      }
      if (subtree.classList.contains('open')) {
        document.body.addEventListener('click', close)
      } else {
        document.body.removeEventListener('click', close)
      }
    })
  })
})

// Fancy wuffles.
/* BUG(jordan): One irritating bug persists in this, even through all the tweaking. Sometimes the
 *   timing is off juuuust enough that a drop will not have a chance to compress at the end of its
 *   fall before the next begins falling, and so it will appear to disappear instead of cleanly
 *   dissipating into the "ground." Not very noticeable, but very frustrating.
 */

function generate_syrup ({
  base_amplitude = 20,
  periods = (Math.random() * 2 + 3)|0,
  period  = (160 / periods)|0,
  freq = (Math.PI * 2) / period,
}) {
  console.log(`Syrup parameters:
      base amplitude: ${base_amplitude}
      periods:   ${periods} (varying 3 → 5 [very rarely 6])
      period:    ${period}
      freq:      ${freq}
  `)

  var pts = Array(periods*period*2|0).fill(0)
  var dollop_pts = []

  console.log(`Syrup: generating cosine drips...`)
  var amplitude, x, y
  for (i = 0; i < periods*period|0; i++) {
    if (i % (period|0) == 0) {
      amplitude = (Math.random()*(15) + 25)
      console.log(`
      Drip: ${i/period|0}
        new amplitude: ${amplitude} (varying 1x → 2x of base)
      `)
    }
    pts[2*i] = x = i
    pts[2*i + 1] = y = (amplitude * Math.cos(freq * (i + (period/2)|0)) + amplitude)
    if (i % (period|0) == (period/2|0)) {
      // "peak" (dip)
      var dollop_radius = 10 * 1 / periods
      console.log(`
        create dollop w/ radius: ${dollop_radius}
        at offset x: ${x} y: ${y}
      `)
      dollop_pts.push({ r: dollop_radius, x: x, y: y })
    }
  }
  console.log(`Sryup: drips generated.`)

  var paths = Array(periods)
  console.log(`Syrup: slicing drips into individuals...`)
  for (p = 0; p < periods; p++) {
    console.log(`Slice: ${p}
      From ${2*(p*period|0)}
      To   ${2*(p*period + period|0)}
    `)
    paths[p] = pts.slice(2*(p*period|0), 2*(p*period + period|0))
  }
  console.log(`Syrup: drips sliced.`)

  return [ periods, period, paths, dollop_pts ]
}

console.log(`Create the SVG using Snap.`)
const svgs = document.querySelectorAll(`.drip-animation`)
const waffles = [].map.call(svgs, drip_svg => {
  const [ periods, period, paths, dollop_pts ] = generate_syrup({})
  const waffle = {
    listeners: {
      'die': [],
      'drop_fall': [],
    },
    paper: Snap(drip_svg),
    drips: [],
    drops: [],
    dripdrops: [],
    periods,
    period,
    paths,
    dollop_pts,
  }

  console.log(`Syrup: adding each path to Paper...`)
  for (let path of waffle.paths) {
    console.log(`
      new polyline: ${path}
      drips.push(...)
    `)
    var drip = waffle.paper.polyline(path)
    drip.attr({
      fill: '#ffd200',
    })
    drip.addClass('drip')
    waffle.drips.push(drip)
  }
  console.log(`Syrup: drips added.`)

  console.log(`Adding each drop to Paper...`)
  for (let { r, x, y } of waffle.dollop_pts) {
    let drop = waffle.paper.circle(x, y, r)
    drop.attr({
      fill: 'transparent'
    })
    drop.data('max_r', r)
    drop.addClass('drop')
    waffle.drops.push(drop)
  }
  console.log(`Syrup: drops added.`)

  console.log(`Syrup: group drips with drops...`)
  for (let [ drip, drop ] of waffle.drips.map((d, i) => [d, waffle.drops[i]])) {
    console.log(`
      Grouping drip ${drip}
               drop ${drop}
    `)
    waffle.dripdrops.push(waffle.paper.g(drip, drop))
  }
  console.log(`Syrup: drip-drops grouped.`)

  function randomScaleTransform () {
    return (0.7*Math.random()) + 0.65
  }

  function dribble (dripdrop, waffle, after) {
    let drip   = dripdrop.select('.drip')
    let scaleY = randomScaleTransform()
      , diff   = scaleY - drip.data('scaleY')
    if (diff < -0.15) {
      const xy = waffle.paths[waffle.drips.indexOf(drip)]
      const ix = waffle.period/2|0
      const evt_params =
        xy.slice(ix, ix+2)
          .concat([ scaleY, Math.abs(diff), waffle.drops[waffle.drips.indexOf(drip)] ])
      // FIXME(jordan): this may be triggered while a drop is already falling, causing it to disappear
      // when its drop starts over. We might be able to generate drops instead of doing things the way
      // we do currently, where each one is created once and then reused. It's another cache
      // invalidation bug! Well, indirectly. At least it's actually one of the "hard things".
      trigger('drop_fall', evt_params, waffle.listeners)
    }
    drip.data('scaleY', scaleY)
    drip.animate({
        transform: (new Snap.Matrix()).scale(1, scaleY)
      },
      1000, n => {
        // NOTE(jordan): Wonky sinusoidal timing function looks nice.
        return 0.5*(Math.sin((n - 0.5) * Math.PI) + 1)
      }, after)
  }

  on('drop_fall', {
    fn: function (x, y, scaleY, magnitude, drop) {
      console.log('Syrup: drop fall!!', x, scaleY*y)

      const adjustedRadius = 0.75 /* magickk */ * drop.data('max_r') * (magnitude+1)

      const yOffset =
          scaleY * drop.attr('cy')
        - 1.75 /* magic numberrr */ * drop.attr('cy')
        - drop.attr('max_r')
      //---------------------------------------------
      //= yOffset

      const txf = new Snap.Matrix()
        .scale(1, 2.5)
        .translate(0, yOffset)

      drop.attr({
        fill: '#ffd200',
        transform: txf,
        r: adjustedRadius
      })
      drop.animate({
        r: drop.data('max_r')*(magnitude+1),
        transform: (new Snap.Matrix()).translate(0, 150 - drop.attr('cy'))
      }, 1000, null, _ => {
        drop.animate({
          r: 0
        }, 500)
      })
      console.log(`Syrup: falling drop:`, drop)
    }
  }, waffle.listeners)

  function dribbleUntilInterrupt (dripdrop, waffle) {
    let stopSignal = false
    function noop () {}

    function next () {
      dribble(dripdrop, waffle, stopSignal ? noop : next)
    }
    dribble(dripdrop, waffle, next)

    on('die', {
      fn: _ => {
        stopSignal = true
      }
    }, waffle.listeners)
  }

  console.log(`Syrup: start perpetually dribbling all drips.`)
  waffle.dripdrops.map((d, i) => {
    setTimeout(_ => dribbleUntilInterrupt(d, waffle), i*1000/waffle.periods)
  })

  /* After "loading" is finished (ie after I feel like you've appreciated my loader)...
   *   Let's move everything into a header-type-deal. WAFFLES witha WIGGLE.
   *   We can do the transitioning using CSS classes. Once the load ends, kill the animation.
   */
})
