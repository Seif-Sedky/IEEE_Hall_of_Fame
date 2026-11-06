import { useState, useEffect, useRef, useMemo } from 'react'
import members from '../data/members.json'
import dishPartyData from '../data/dish-party.json'

const B = import.meta.env.BASE_URL
const byId = Object.fromEntries(members.map(m => [m.id, m]))

// ── Pixel character sprites (9×13 grid of rows) ──────────────────────────────
// Each character is defined as an array of rows, '#' = pixel on
// Colors are themed to the site palette
const SPRITE_COLORS = ['#f81840','#3888e8','#f8a808','#58a0b0','#004898','#f81840','#3888e8','#f8a808']

// A simple walking pixel person: 9 wide × 13 tall
// Frame A (legs apart) and Frame B (legs together)
const BODY_A = [
  '...###...',
  '..#####..',
  '...###...',
  '..#####..',
  '.#######.',
  '...###...',
  '...###...',
  '..#.#.#..',
  '.##...##.',
  '.#.....#.',
]
const BODY_B = [
  '...###...',
  '..#####..',
  '...###...',
  '..#####..',
  '.#######.',
  '...###...',
  '...###...',
  '..#####..',
  '..##.##..',
  '..#...#..',
]

function PixelSprite({ color, frame = 0, flipped = false, size = 1 }) {
  const rows = frame % 2 === 0 ? BODY_A : BODY_B
  const W = 9, H = rows.length
  const px = size * 2
  return (
    <svg
      width={W * px} height={H * px}
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      style={{ transform: flipped ? 'scaleX(-1)' : 'none', display: 'block', imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '#' && <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
        )
      )}
    </svg>
  )
}

// ── Walking character on the scene ───────────────────────────────────────────
function WalkingCharacter({ person, colorIdx, startX, startY, speed, onClick, tableRect }) {
  const [pos, setPos] = useState({ x: startX, y: startY })
  const [frame, setFrame] = useState(0)
  const [dir, setDir] = useState(speed > 0 ? 1 : -1)
  const [hover, setHover] = useState(false)
  const posRef = useRef({ x: startX, y: startY, dir: speed > 0 ? 1 : -1 })
  const animRef = useRef(null)
  const frameRef = useRef(null)
  const color = SPRITE_COLORS[colorIdx % SPRITE_COLORS.length]

  useEffect(() => {
    // Animate position
    let lastTime = 0
    function step(ts) {
      if (ts - lastTime > 60) {
        lastTime = ts
        posRef.current.x += posRef.current.dir * Math.abs(speed)
        // Bounce at edges (0–100 range, percentage)
        if (posRef.current.x > 92) { posRef.current.x = 92; posRef.current.dir = -1 }
        if (posRef.current.x < 1) { posRef.current.x = 1; posRef.current.dir = 1 }
        setPos({ x: posRef.current.x, y: posRef.current.y })
        setDir(posRef.current.dir)
      }
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [speed])

  useEffect(() => {
    // Animate walk frame
    frameRef.current = setInterval(() => setFrame(f => f + 1), 200)
    return () => clearInterval(frameRef.current)
  }, [])

  const label = person.name.split(' ')[0]
  const isVibes = person.dishType === 'vibes'

  return (
    <div
      className={`dp-char${isVibes ? ' dp-char-vibes' : ''}`}
      style={{ left: pos.x + '%', top: pos.y + '%', '--char-color': color }}
      onClick={() => onClick(person)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={label}
    >
      <PixelSprite color={isVibes ? '#f8a808' : color} frame={frame} flipped={dir < 0} size={1} />
      <span className="dp-char-name px">{label}</span>
      {hover && <span className="dp-char-bubble">{person.emoji}</span>}
      {isVibes && <span className="dp-vibes-crown">★</span>}
    </div>
  )
}

// ── Food items on the table ──────────────────────────────────────────────────
const FOOD_EMOJIS_TABLE = ['🍗','🍰','🌯','🥗','🍫','🫓','🍹','🍸','🥧','🎂','🍪','🥮','🧁','🍝','🍃','🥞','🌮','🍚','🫖','🍽️']

function FoodItem({ item, idx, onClick }) {
  const [jiggle, setJiggle] = useState(false)
  const angle = (idx % 2 === 0 ? 1 : -1) * (8 + (idx % 3) * 4)
  return (
    <button
      className={`dp-food-item${jiggle ? ' dp-food-jiggle' : ''}`}
      style={{ '--angle': angle + 'deg' }}
      onClick={() => onClick(item)}
      onMouseEnter={() => setJiggle(true)}
      onMouseLeave={() => setJiggle(false)}
      title={item.dish}
    >
      <span className="dp-food-emoji">{item.emoji}</span>
    </button>
  )
}

// ── Modal / Info card ────────────────────────────────────────────────────────
const DISH_TYPE_LABELS = { food: 'SAVOURY DISH', sweet: 'SWEET TREAT', drink: 'DRINK', supplies: 'PARTY SUPPLIES', vibes: 'VIBE MERCHANT' }
const DISH_TYPE_COLORS = { food: '#3888e8', sweet: '#f81840', drink: '#58a0b0', supplies: '#f8a808', vibes: '#f8a808' }

function DishCard({ person, close }) {
  const member = byId[person.memberId]
  if (!member) return null
  const isVibes = person.dishType === 'vibes'
  const typeColor = DISH_TYPE_COLORS[person.dishType] || '#004898'
  const typeLabel = DISH_TYPE_LABELS[person.dishType] || 'DISH'

  return (
    <div className="overlay" onClick={close}>
      <div className="dp-modal note" onClick={e => e.stopPropagation()}>
        <button className="x" onClick={close}>X</button>

        {/* Pixel art header bar */}
        <div className="dp-modal-header" style={{ '--hc': typeColor }}>
          <span className="dp-modal-emoji">{person.emoji}</span>
          <span className="px dp-modal-type">{typeLabel}</span>
        </div>

        <div className="dp-modal-body">
          <img src={B + member.photo} alt={member.name} className="dp-modal-photo" />
          <div>
            <h3 className="dp-modal-name">{member.name}</h3>
            <p className="dp-modal-role role">{member.role}</p>
          </div>
        </div>

        {isVibes ? (
          <div className="dp-vibes-box">
            <p className="px" style={{ fontSize: 8, color: typeColor, marginBottom: 10 }}>SPECIAL CONTRIBUTION</p>
            <p className="dp-vibes-text hand">
              Showed up with the best dish of all — their presence. 🌟
            </p>
            <p className="dp-vibes-sub px">THE PARTY WOULDN'T BE THE SAME WITHOUT THEM.</p>
          </div>
        ) : (
          <div className="dp-dish-box" style={{ '--dc': typeColor }}>
            <p className="px" style={{ fontSize: 7, color: typeColor, marginBottom: 6 }}>BROUGHT TO THE TABLE</p>
            <p className="dp-dish-name hand">{person.dish}</p>
          </div>
        )}

        {member.statement && (
          <p className="quote dp-modal-quote">"{member.statement}"</p>
        )}

        {/* Pixel decoration dots */}
        <div className="dp-modal-dots" aria-hidden="true">
          {[...Array(8)].map((_, i) => <span key={i} style={{ background: SPRITE_COLORS[i] }} />)}
        </div>
      </div>
    </div>
  )
}

// ── Steam animation on table ─────────────────────────────────────────────────
function Steam({ x, delay }) {
  return (
    <div className="dp-steam" style={{ left: x + '%', animationDelay: delay + 'ms' }} aria-hidden="true">
      ~~~
    </div>
  )
}

// ── Main DishParty component ─────────────────────────────────────────────────
export default function DishParty() {
  const [selected, setSelected] = useState(null)

  // Build enriched attendee list
  const attendees = useMemo(() => {
    return dishPartyData.attendees.map((a, i) => {
      const m = byId[a.memberId] || {}
      return { ...a, ...m, colorIdx: i }
    })
  }, [])

  // Split: food on table vs characters walking
  const tableFood = attendees.filter(a => a.dish !== null)
  const allChars = attendees

  // Assign deterministic positions & speeds for walking characters
  const charConfigs = useMemo(() => {
    return allChars.map((a, i) => {
      // distribute around 3 "lanes" around the table
      const lane = i % 3
      const yBase = lane === 0 ? 8 : lane === 1 ? 78 : 44
      const startX = (i * 17 + 3) % 90
      const speed = (i % 2 === 0 ? 0.4 : -0.4) * (1 + (i % 3) * 0.15)
      return { startX, startY: yBase, speed }
    })
  }, [allChars])

  const vibes = attendees.filter(a => a.dishType === 'vibes')
  const contributors = attendees.filter(a => a.dishType !== 'vibes')

  return (
    <div className="dp-root">
      {/* ── Title ── */}
      <div className="bar-title dp-title-row">
        <h2 className="dp-title">🍽️ DISH PARTY</h2>
        <span className="px dp-subtitle">CLICK A CHARACTER TO SEE THEIR DISH</span>
      </div>

      {/* ── Scene: table + walking chars ── */}
      <div className="dp-scene" role="region" aria-label="Dish Party Scene">

        {/* Walking characters */}
        {allChars.map((person, i) => (
          <WalkingCharacter
            key={person.memberId}
            person={person}
            colorIdx={person.colorIdx}
            startX={charConfigs[i].startX}
            startY={charConfigs[i].startY}
            speed={charConfigs[i].speed}
            onClick={setSelected}
          />
        ))}

        {/* ── The Big Table ── */}
        <div className="dp-table-wrap">
          <div className="dp-table">
            <div className="dp-table-label px">THE FEAST TABLE</div>

            {/* Steam wisps */}
            {[15, 32, 50, 68, 83].map((x, i) => (
              <Steam key={i} x={x} delay={i * 400} />
            ))}

            {/* Food grid on table */}
            <div className="dp-food-grid">
              {tableFood.map((item, idx) => (
                <FoodItem key={item.memberId} item={item} idx={idx} onClick={setSelected} />
              ))}
            </div>

            {/* Table legs */}
            <div className="dp-table-legs">
              <span /><span /><span /><span />
            </div>
          </div>
        </div>

        {/* ── Pixel floor decoration ── */}
        <div className="dp-floor" aria-hidden="true">
          {[...Array(32)].map((_, i) => <span key={i} className="dp-tile" style={{ '--ti': i }} />)}
        </div>
      </div>

      {/* ── Vibes section callout ── */}
      {vibes.length > 0 && (
        <div className="dp-vibes-banner">
          <span className="dp-vibes-star">★</span>
          <div>
            <p className="px" style={{ fontSize: 8, color: '#f8a808', margin: '0 0 4px' }}>SPECIAL AWARD</p>
            <p className="hand dp-vibes-banner-text">
              {vibes.map(v => v.name.split(' ')[0]).join(' & ')} brought something money can't buy — good vibes only. 🌟
            </p>
          </div>
          <span className="dp-vibes-star">★</span>
        </div>
      )}

      {/* ── Dish legend ── */}
      <h2 className="sec dp-legend-title">THE FULL MENU</h2>
      <div className="dp-legend">
        {contributors.map(a => (
          <button
            key={a.memberId}
            className="dp-legend-item"
            style={{ '--lc': DISH_TYPE_COLORS[a.dishType] || '#004898' }}
            onClick={() => setSelected(a)}
          >
            <span className="dp-legend-emoji">{a.emoji}</span>
            <span className="dp-legend-name">{a.name.split(' ')[0]}</span>
            <span className="dp-legend-dish px">{a.dish}</span>
          </button>
        ))}
      </div>

      {/* ── Modal ── */}
      {selected && <DishCard person={selected} close={() => setSelected(null)} />}
    </div>
  )
}

