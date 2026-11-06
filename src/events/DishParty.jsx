import { useState, useEffect, useRef, useMemo } from 'react'
import members from '../data/members.json'
import dishPartyData from '../data/dish-party.json'

const B = import.meta.env.BASE_URL
const byId = Object.fromEntries(members.map(m => [m.id, m]))

// ── 8-bit / 16-bit Hairstyle & Clothing Archetypes (12 wide × 5 tall for head) ────────
// Tokens: H = Hair, S = Skin, E = Eye (#181020), A = Accessory (hat / hijab / beanie)
const ARCHETYPES = {
  short: {
    hairTop: [
      '....HHHH....',
      '..HHHHHHHH..',
      '.HHSSSSSSHH.',
      '.HH.E..E.HH.',
      '....SSSS....',
    ],
  },
  spiky: {
    hairTop: [
      '..H.HH.HH.H.',
      '.HHHHHHHHHH.',
      '.HHSSSSSSHH.',
      '.HH.E..E.HH.',
      '....SSSS....',
    ],
  },
  curly: {
    hairTop: [
      '..HHHHHHHH..',
      '.HHHHHHHHHH.',
      '.HHSSSSSSHH.',
      '.HH.E..E.HH.',
      '.HH.SSSS.HH.',
    ],
  },
  long: {
    hairTop: [
      '....HHHH....',
      '..HHHHHHHH..',
      '.HHSSSSSSHH.',
      '.HH.E..E.HH.',
      '.HH.SSSS.HH.',
    ],
  },
  bob: {
    hairTop: [
      '....HHHH....',
      '..HHHHHHHH..',
      '.HHSSSSSSHH.',
      '.HH.E..E.HH.',
      '.HH.SSSS.HH.',
    ],
  },
  cap: {
    hairTop: [
      '....AAAA....',
      '..AAAAAAAA..',
      '.AAAAAAAAAA.',
      '...SE..ES...',
      '....SSSS....',
    ],
  },
  hijab: {
    hairTop: [
      '....AAAA....',
      '..AAAAAAAA..',
      '.AAASSSSAAA.',
      '.AA.E..E.AA.',
      '..AAAAAAAA..',
    ],
  },
  beanie: {
    hairTop: [
      '...AAAAAA...',
      '..AAAAAAAA..',
      '.HHHHHHHHHH.',
      '.HH.E..E.HH.',
      '....SSSS....',
    ],
  },
}

// ── Unique Styling for Each Attendee ──────────────────────────────────────────
const CHARACTER_STYLES = {
  'omar-abouelnaga': {
    archetype: 'curly',
    hairColor: '#3d2314',
    skinColor: '#f5c396',
    shirtColor: '#f81840',
    pantsColor: '#8d775f',
    shoesColor: '#ffffff',
    accessoryColor: '#f8a808',
  },
  'malak-abdelgawad': {
    archetype: 'long',
    hairColor: '#1a110b',
    skinColor: '#ffdfc4',
    shirtColor: '#58a0b0',
    pantsColor: '#2b2d42',
    shoesColor: '#ffffff',
    accessoryColor: '#58a0b0',
  },
  'judy-yasser': {
    archetype: 'hijab',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#004898',
    pantsColor: '#2b2d42',
    shoesColor: '#f8f8f8',
    accessoryColor: '#f8a808',
  },
  'sama-fayez': {
    archetype: 'bob',
    hairColor: '#6a462f',
    skinColor: '#ffdfc4',
    shirtColor: '#f81840',
    pantsColor: '#1c3144',
    shoesColor: '#ffffff',
    accessoryColor: '#f81840',
  },
  'hala-aboraya': {
    archetype: 'long',
    hairColor: '#2a1a10',
    skinColor: '#f5c396',
    shirtColor: '#6b3410',
    pantsColor: '#1c3144',
    shoesColor: '#ffffff',
    accessoryColor: '#f8a808',
  },
  'shahd-hisham': {
    archetype: 'long',
    hairColor: '#111115',
    skinColor: '#ffdfc4',
    shirtColor: '#3888e8',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#3888e8',
  },
  'sama-sherif': {
    archetype: 'hijab',
    hairColor: '#1a110b',
    skinColor: '#ffdfc4',
    shirtColor: '#f8f8f8',
    pantsColor: '#58a0b0',
    shoesColor: '#ffffff',
    accessoryColor: '#58a0b0',
  },
  'roaa-wael': {
    archetype: 'long',
    hairColor: '#3d2314',
    skinColor: '#f5c396',
    shirtColor: '#c41535',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#c41535',
  },
  'youssef-mostafa': {
    archetype: 'spiky',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#004898',
    pantsColor: '#181020',
    shoesColor: '#f8a808',
    accessoryColor: '#004898',
  },
  'albarra-mohamed': {
    archetype: 'cap',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#f81840',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#f81840',
  },
  'hana-mohamed': {
    archetype: 'beanie',
    hairColor: '#5a3d28',
    skinColor: '#ffdfc4',
    shirtColor: '#f8a808',
    pantsColor: '#2b2d42',
    shoesColor: '#ffffff',
    accessoryColor: '#3888e8',
  },
  'david-bishoy': {
    archetype: 'short',
    hairColor: '#111115',
    skinColor: '#f5c396',
    shirtColor: '#f8a808',
    pantsColor: '#1c3144',
    shoesColor: '#3d2314',
    accessoryColor: '#f8a808',
  },
  'jana-saleh': {
    archetype: 'long',
    hairColor: '#1a110b',
    skinColor: '#ffdfc4',
    shirtColor: '#8e44ad',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#8e44ad',
  },
  'tasneem-elshafey': {
    archetype: 'hijab',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#f8f8f8',
    pantsColor: '#1c3144',
    shoesColor: '#ffffff',
    accessoryColor: '#3888e8',
  },
  'shams-raafat': {
    archetype: 'long',
    hairColor: '#111115',
    skinColor: '#ffdfc4',
    shirtColor: '#f81840',
    pantsColor: '#181020',
    shoesColor: '#f8a808',
    accessoryColor: '#f81840',
  },
  'omar-elsamalouty': {
    archetype: 'short',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#004898',
    pantsColor: '#4a5568',
    shoesColor: '#ffffff',
    accessoryColor: '#004898',
  },
  'ismaeel-awad': {
    archetype: 'spiky',
    hairColor: '#3d2314',
    skinColor: '#f5c396',
    shirtColor: '#58a0b0',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#58a0b0',
  },
  'abdelrahman-mohamed': {
    archetype: 'beanie',
    hairColor: '#111115',
    skinColor: '#f5c396',
    shirtColor: '#181020',
    pantsColor: '#2b2d42',
    shoesColor: '#f8a808',
    accessoryColor: '#3888e8',
  },
  'ahmed-tamer': {
    archetype: 'cap',
    hairColor: '#111115',
    skinColor: '#f5c396',
    shirtColor: '#2b2d42',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#181020',
  },
  'mohamed-magedd': {
    archetype: 'short',
    hairColor: '#111115',
    skinColor: '#f5c396',
    shirtColor: '#3888e8',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#3888e8',
  },
  'abdelrahman-tebry': {
    archetype: 'spiky',
    hairColor: '#5a3d28',
    skinColor: '#f5c396',
    shirtColor: '#27ae60',
    pantsColor: '#1c3144',
    shoesColor: '#3d2314',
    accessoryColor: '#27ae60',
  },
  'seif-alaa': {
    archetype: 'short',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#d35400',
    pantsColor: '#1c3144',
    shoesColor: '#f8a808',
    accessoryColor: '#f8a808',
  },
  'eyad-sameh': {
    archetype: 'curly',
    hairColor: '#1a110b',
    skinColor: '#f5c396',
    shirtColor: '#3888e8',
    pantsColor: '#181020',
    shoesColor: '#f8a808',
    accessoryColor: '#f8a808',
  },
  'rodina-wael': {
    archetype: 'long',
    hairColor: '#3d2314',
    skinColor: '#ffdfc4',
    shirtColor: '#f06292',
    pantsColor: '#181020',
    shoesColor: '#ffffff',
    accessoryColor: '#f8a808',
  },
}

// ── Multi-tone 16-bit Pixel Sprite Component ──────────────────────────────────
function PixelSprite({ styleConfig, frame = 0, flipped = false }) {
  const {
    archetype = 'short',
    hairColor = '#3d2314',
    skinColor = '#f5c396',
    shirtColor = '#004898',
    pantsColor = '#1c3144',
    shoesColor = '#ffffff',
    accessoryColor = '#f8a808',
  } = styleConfig || {}

  const arch = ARCHETYPES[archetype] || ARCHETYPES.short
  const hairRows = arch.hairTop

  // Construct full 12×15 sprite
  const rows = [
    hairRows[0],
    hairRows[1],
    hairRows[2],
    hairRows[3],
    hairRows[4],
    // Row 5: neck
    archetype === 'hijab' ? '..AAAAAAAA..' : '....SSSS....',
    // Row 6: shoulders / upper shirt
    archetype === 'long'
      ? '.HHTTTTTTHH.'
      : archetype === 'hijab'
      ? '.AATTTTTTAA.'
      : '.TTTTTTTTTT.',
    // Row 7: chest
    archetype === 'long'
      ? '.HHTTTTTTHH.'
      : '.TTTTTTTTTT.',
    // Row 8: torso
    '..TTTTTTTT..',
    // Row 9: waist
    '..PPPPPPPP..',
    // Rows 10-14: walk frame animation
    ...(frame % 2 === 0
      ? [
          '..PP....PP..',
          '.PP......PP.',
          '.PP......PP.',
          'BB........BB',
          'BB........BB',
        ]
      : [
          '..PPPPPPPP..',
          '...PPPPPP...',
          '....PPPP....',
          '...BB..BB...',
          '...BB..BB...',
        ]),
  ]

  const colorMap = {
    H: hairColor,
    S: skinColor,
    E: '#181020',
    T: shirtColor,
    P: pantsColor,
    B: shoesColor,
    A: accessoryColor,
  }

  const W = 12, H = 15
  return (
    <svg
      width="36"
      height="45"
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      style={{
        transform: flipped ? 'scaleX(-1)' : 'none',
        display: 'block',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = colorMap[char]
          if (!fill) return null
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
            />
          )
        })
      )}
    </svg>
  )
}

// ── Perimeter Path Around the Table ──────────────────────────────────────────
// Ensures characters circulate exclusively in the corridor around the table,
// NEVER stepping onto the tabletop and NEVER wandering far off to scene bounds.
function getPerimeterPos(t, track, speed) {
  const { xMin, xMax, yTop, yBottom } = track
  const tNorm = ((t % 1) + 1) % 1

  let x, y, baseDir, zIndex

  // Segments (Clockwise):
  // 0.00 -> 0.35: Top edge (behind table)
  // 0.35 -> 0.50: Right edge
  // 0.50 -> 0.85: Bottom edge (in front of table)
  // 0.85 -> 1.00: Left edge
  if (tNorm < 0.35) {
    const u = tNorm / 0.35
    x = xMin + u * (xMax - xMin)
    y = yTop
    baseDir = 1 // moving right
    zIndex = 4 // behind the table
  } else if (tNorm < 0.50) {
    const u = (tNorm - 0.35) / 0.15
    x = xMax
    y = yTop + u * (yBottom - yTop)
    baseDir = 1
    zIndex = u > 0.5 ? 8 : 4
  } else if (tNorm < 0.85) {
    const u = (tNorm - 0.50) / 0.35
    x = xMax - u * (xMax - xMin)
    y = yBottom
    baseDir = -1 // moving left
    zIndex = 8 // in front of the table
  } else {
    const u = (tNorm - 0.85) / 0.15
    x = xMin
    y = yBottom - u * (yBottom - yTop)
    baseDir = -1
    zIndex = u > 0.5 ? 4 : 8
  }

  // Face movement direction
  const dir = speed >= 0 ? baseDir : -baseDir

  return { x, y, dir, zIndex }
}

// ── Concentric Orbit Tracks Around the Table ──────────────────────────────────
const TRACKS = [
  // Inner track
  { xMin: 14, xMax: 86, yTop: 19, yBottom: 76 },
  // Mid track
  { xMin: 11, xMax: 89, yTop: 15, yBottom: 80 },
  // Outer track
  { xMin: 8,  xMax: 92, yTop: 12, yBottom: 84 },
]

// ── Walking Character Component ───────────────────────────────────────────────
function WalkingCharacter({ person, track, startProgress, speed, styleConfig, onClick }) {
  const [progress, setProgress] = useState(startProgress)
  const [frame, setFrame] = useState(0)
  const [hover, setHover] = useState(false)
  const animRef = useRef(null)
  const progressRef = useRef(startProgress)
  const hoverRef = useRef(false)
  hoverRef.current = hover

  useEffect(() => {
    let lastTs = performance.now()
    function loop(ts) {
      const dt = Math.min(ts - lastTs, 100)
      lastTs = ts
      if (!hoverRef.current) {
        progressRef.current = (progressRef.current + speed * (dt / 16.6)) % 1
        if (progressRef.current < 0) progressRef.current += 1
        setProgress(progressRef.current)
      }
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [speed])

  useEffect(() => {
    if (hover) return
    const id = setInterval(() => setFrame(f => f + 1), 180)
    return () => clearInterval(id)
  }, [hover])

  const pos = getPerimeterPos(progress, track, speed)
  const label = person.name.split(' ')[0]
  const isVibes = person.dishType === 'vibes'

  return (
    <div
      className={`dp-char${isVibes ? ' dp-char-vibes' : ''}${hover ? ' dp-char-hover' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex: hover ? 35 : pos.zIndex,
      }}
      onClick={() => onClick(person)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${person.name} (${person.dish || 'Good Vibes'})`}
    >
      {/* Golden crown badge for Eyad & Rodina */}
      {isVibes && <span className="dp-vibes-crown" aria-hidden="true">★</span>}

      {/* Speech bubble on hover */}
      {hover && (
        <div className="dp-char-bubble">
          <span className="dp-bubble-emoji">{person.emoji}</span>
          <span className="dp-bubble-dish">{person.dish || 'Good Vibes!'}</span>
        </div>
      )}

      {/* Unique Pixel Sprite */}
      <PixelSprite
        styleConfig={styleConfig}
        frame={frame}
        flipped={pos.dir < 0}
      />

      {/* Arcade Name Tag */}
      <span className="dp-char-name px">{label}</span>
    </div>
  )
}

// ── Food items on the table ──────────────────────────────────────────────────
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
      title={`${item.dish} (brought by ${item.name.split(' ')[0]})`}
    >
      <span className="dp-food-emoji">{item.emoji}</span>
    </button>
  )
}

// ── Modal / Profile card ─────────────────────────────────────────────────────
const DISH_TYPE_LABELS = {
  food: 'SAVOURY DISH',
  sweet: 'SWEET TREAT',
  drink: 'DRINK',
  supplies: 'PARTY SUPPLIES',
  vibes: 'VIBE MERCHANT',
}
const DISH_TYPE_COLORS = {
  food: '#3888e8',
  sweet: '#f81840',
  drink: '#58a0b0',
  supplies: '#f8a808',
  vibes: '#f8a808',
}

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

        {/* Special tribute note only when Eyad or Rodina is pressed */}
        {isVibes ? (
          <div className="dp-vibes-box">
            <p className="px" style={{ fontSize: 8, color: typeColor, marginBottom: 8 }}>SPECIAL CONTRIBUTION</p>
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

        {/* Pixel decoration dots */}
        <div className="dp-modal-dots" aria-hidden="true">
          {['#f81840','#3888e8','#f8a808','#58a0b0','#004898','#f81840','#3888e8','#f8a808'].map((c, i) => (
            <span key={i} style={{ background: c }} />
          ))}
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

// ── Main DishParty Component ─────────────────────────────────────────────────
export default function DishParty() {
  const [selected, setSelected] = useState(null)

  // Enrich attendees with member details
  const attendees = useMemo(() => {
    return dishPartyData.attendees.map((a, i) => {
      const m = byId[a.memberId] || {}
      return { ...a, ...m, idx: i }
    })
  }, [])

  // Food on table (excluding vibes merchants)
  const tableFood = attendees.filter(a => a.dish !== null)

  // Configure movement parameters for each attendee around the table
  const characterConfigs = useMemo(() => {
    const total = attendees.length
    return attendees.map((a, i) => {
      const track = TRACKS[i % TRACKS.length]
      // Stagger starting progress smoothly around the table
      const startProgress = (i * (1 / total) + (i % 3) * 0.02) % 1
      // Alternating speeds and directions (clockwise & counter-clockwise)
      const dirSign = i % 2 === 0 ? 1 : -1
      const speed = dirSign * (0.00038 + (i % 4) * 0.00007)
      const styleConfig = CHARACTER_STYLES[a.memberId] || {
        archetype: 'short',
        hairColor: '#3d2314',
        skinColor: '#f5c396',
        shirtColor: '#3888e8',
        pantsColor: '#1c3144',
        shoesColor: '#ffffff',
        accessoryColor: '#f8a808',
      }
      return { track, startProgress, speed, styleConfig }
    })
  }, [attendees])

  const contributors = attendees.filter(a => a.dishType !== 'vibes')

  return (
    <div className="dp-root">
      {/* ── Title Row ── */}
      <div className="bar-title dp-title-row">
        <h2 className="dp-title">🍽️ DISH PARTY</h2>
        <span className="px dp-subtitle">CLICK A CHARACTER TO SEE THEIR DISH</span>
      </div>

      {/* ── Scene: Big Table with Characters Orbiting Around It ── */}
      <div className="dp-scene" role="region" aria-label="Dish Party Scene">

        {/* Characters circulating around the table */}
        {attendees.map((person, i) => (
          <WalkingCharacter
            key={person.memberId}
            person={person}
            track={characterConfigs[i].track}
            startProgress={characterConfigs[i].startProgress}
            speed={characterConfigs[i].speed}
            styleConfig={characterConfigs[i].styleConfig}
            onClick={setSelected}
          />
        ))}

        {/* ── The Big Banquet Table ── */}
        <div className="dp-table-wrap">
          <div className="dp-table">
            <div className="dp-table-label px">THE FEAST TABLE</div>

            {/* Steam wisps */}
            {[15, 32, 50, 68, 83].map((x, i) => (
              <Steam key={i} x={x} delay={i * 400} />
            ))}

            {/* Food items on the table */}
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

        {/* Pixel floor decoration */}
        <div className="dp-floor" aria-hidden="true">
          {[...Array(32)].map((_, i) => (
            <span key={i} className="dp-tile" style={{ '--ti': i }} />
          ))}
        </div>
      </div>

      {/* ── The Full Menu ── */}
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

      {/* ── Modal (Shows dish profile, or special tribute when Eyad or Rodina is pressed) ── */}
      {selected && <DishCard person={selected} close={() => setSelected(null)} />}
    </div>
  )
}
