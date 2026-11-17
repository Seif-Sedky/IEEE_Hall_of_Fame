import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import members from '../data/members.json'

const B = import.meta.env.BASE_URL
const byId = Object.fromEntries(members.map(m => [m.id, m]))

// All opening photos (1–27)
const OPENING_PHOTOS = Array.from({ length: 27 }, (_, i) => `opening/${i + 1}.jpg`)

// ─── Floating Particle ───────────────────────────────────────────────────────
function FloatingParticle({ type, style }) {
  const icons = { bat: '🦇', mask: '🎭', sparkle: '✦', star: '★', note: '♪' }
  return <span className="op-particle" style={style} aria-hidden="true">{icons[type] || '✦'}</span>
}

// ─── Pixel Masquerade Character ──────────────────────────────────────────────
const MASKED_ARCHETYPES = {
  short: [
    '....HHHH....',
    '..HHHHHHHH..',
    '.HHMMMMMSHH.',
    '.HH.M..M.HH.',
    '....SSSS....',
  ],
  long: [
    '....HHHH....',
    '..HHHHHHHH..',
    '.HHMMMMMSHH.',
    '.HH.M..M.HH.',
    '.HH.SSSS.HH.',
  ],
  hijab: [
    '....AAAA....',
    '..AAAAAAAA..',
    '.AAAMMMSAAA.',
    '.AA.M..M.AA.',
    '..AAAAAAAA..',
  ],
  cap: [
    '....CCCC....',
    '..CCCCCCCC..',
    '.CCMMMMMCCC.',
    '...SM..MS...',
    '....SSSS....',
  ],
  curly: [
    '..HHHHHHHH..',
    '.HHHHHHHHHH.',
    '.HHMMMMMSHH.',
    '.HH.M..M.HH.',
    '.HH.SSSS.HH.',
  ],
}

function MasquCharSprite({ archetype = 'short', skinColor = '#f5c396', hairColor = '#1a110b',
  maskColor = '#1a3a8c', shirtColor = '#181020', pantsColor = '#1a1a2e',
  shoesColor = '#c9a84c', accessoryColor = '#c9a84c', frame = 0, seated = false,
  size = 1 }) {

  const hairRows = MASKED_ARCHETYPES[archetype] || MASKED_ARCHETYPES.short
  const isHijab = archetype === 'hijab'
  const isLong = archetype === 'long'

  const rows = seated ? [
    hairRows[0], hairRows[1], hairRows[2], hairRows[3], hairRows[4],
    isHijab ? '..AAAAAAAA..' : '....SSSS....',
    isLong ? '.HHTTTTTTHH.' : isHijab ? '.AATTTTTTAA.' : '.TTTTTTTTTT.',
    isLong ? '.HHTTTTTTHH.' : '.TTTTTTTTTT.',
    '..TTTTTTTT..', '..PPPPPPPP..', '..PP....PP..', '..PP....PP..',
  ] : [
    hairRows[0], hairRows[1], hairRows[2], hairRows[3], hairRows[4],
    isHijab ? '..AAAAAAAA..' : '....SSSS....',
    isLong ? '.HHTTTTTTHH.' : isHijab ? '.AATTTTTTAA.' : '.TTTTTTTTTT.',
    isLong ? '.HHTTTTTTHH.' : '.TTTTTTTTTT.',
    '..TTTTTTTT..', '..PPPPPPPP..',
    ...(frame % 2 === 0
      ? ['..PP....PP..', '.PP......PP.', '.PP......PP.', 'BB........BB', 'BB........BB']
      : ['..PPPPPPPP..', '...PPPPPP...', '....PPPP....', '...BB..BB...', '...BB..BB...']),
  ]

  const colorMap = { H: hairColor, S: skinColor, E: '#c9a84c', M: maskColor, T: shirtColor, P: pantsColor, B: shoesColor, A: accessoryColor, C: '#1a110b' }
  const W = 12, HPx = seated ? 12 : 15
  const w = Math.round(34 * size), h = Math.round((seated ? 36 : 42) * size)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${W} ${HPx}`} shapeRendering="crispEdges"
      style={{ display: 'block', imageRendering: 'pixelated' }} aria-hidden="true">
      {rows.flatMap((row, y) => [...row].map((char, x) => {
        const fill = colorMap[char]
        return fill ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} /> : null
      }))}
    </svg>
  )
}

// ─── Character config pool ────────────────────────────────────────────────────
const ATTENDEE_POOL = [
  { archetype: 'short', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#1a3a8c', shirtColor: '#1a1a2e', shoesColor: '#c9a84c' },
  { archetype: 'long', skinColor: '#ffdfc4', hairColor: '#3d2314', maskColor: '#6b2fa0', shirtColor: '#0a0a1a', shoesColor: '#c9a84c' },
  { archetype: 'hijab', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#c41535', shirtColor: '#181028', accessoryColor: '#c9a84c', shoesColor: '#fff' },
  { archetype: 'short', skinColor: '#523d2c', hairColor: '#1a110b', maskColor: '#1a3a8c', shirtColor: '#040410', shoesColor: '#c9a84c' },
  { archetype: 'long', skinColor: '#ffdfc4', hairColor: '#5a3d28', maskColor: '#27ae60', shirtColor: '#0a1020', shoesColor: '#fff' },
  { archetype: 'hijab', skinColor: '#ffdfc4', hairColor: '#1a110b', maskColor: '#3888e8', shirtColor: '#1a1a2e', accessoryColor: '#c9a84c', shoesColor: '#c9a84c' },
  { archetype: 'short', skinColor: '#f5c396', hairColor: '#3d2314', maskColor: '#8b1a1a', shirtColor: '#12121e', shoesColor: '#c9a84c' },
  { archetype: 'long', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#004898', shirtColor: '#1e1e30', shoesColor: '#fff' },
  { archetype: 'hijab', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#c9a84c', shirtColor: '#0e0e1c', accessoryColor: '#004898', shoesColor: '#c9a84c' },
  { archetype: 'cap', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#1a3a8c', shirtColor: '#181020', shoesColor: '#fff' },
  { archetype: 'short', skinColor: '#ffdfc4', hairColor: '#6a462f', maskColor: '#6b2fa0', shirtColor: '#0a0a1e', shoesColor: '#c9a84c' },
  { archetype: 'long', skinColor: '#f5c396', hairColor: '#111115', maskColor: '#1a3a8c', shirtColor: '#181028', shoesColor: '#c9a84c' },
  { archetype: 'curly', skinColor: '#f5c396', hairColor: '#3d2314', maskColor: '#c9a84c', shirtColor: '#0d0d1c', shoesColor: '#fff' },
  { archetype: 'hijab', skinColor: '#ffdfc4', hairColor: '#1a110b', maskColor: '#f06292', shirtColor: '#14142a', accessoryColor: '#f06292', shoesColor: '#c9a84c' },
  { archetype: 'short', skinColor: '#523d2c', hairColor: '#111115', maskColor: '#27ae60', shirtColor: '#0a1020', shoesColor: '#c9a84c' },
  { archetype: 'long', skinColor: '#ffdfc4', hairColor: '#5a3d28', maskColor: '#8e44ad', shirtColor: '#12122a', shoesColor: '#fff' },
]
const cfgAt = i => ATTENDEE_POOL[i % ATTENDEE_POOL.length]

const HOST_STYLES = {
  'hala-aboraya': { archetype: 'hijab', skinColor: '#f5c396', hairColor: '#2a1a10', maskColor: '#c9a84c', shirtColor: '#0d0d20', accessoryColor: '#c9a84c', shoesColor: '#c9a84c' },
  'abdelrahman-tebry': { archetype: 'curly', skinColor: '#f5c396', hairColor: '#5a3d28', maskColor: '#1a3a8c', shirtColor: '#0a1020', shoesColor: '#c9a84c' },
  'youssef-mostafa': { archetype: 'curly', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#c9a84c', shirtColor: '#0a0a1e', shoesColor: '#c9a84c' },
  'shahd-hisham': { archetype: 'long', skinColor: '#ffdfc4', hairColor: '#111115', maskColor: '#3888e8', shirtColor: '#181020', shoesColor: '#fff' },
  'roaa-wael': { archetype: 'hijab', skinColor: '#f5c396', hairColor: '#3d2314', maskColor: '#c41535', shirtColor: '#181020', accessoryColor: '#c41535', shoesColor: '#fff' },
  'hana-mohamed': { archetype: 'long', skinColor: '#ffdfc4', hairColor: '#5a3d28', maskColor: '#f8a808', shirtColor: '#0a1020', shoesColor: '#fff' },
  'seif-alaa': { archetype: 'short', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#d35400', shirtColor: '#1a1a2e', shoesColor: '#c9a84c' },
}

// ─── Useanimframe helper ─────────────────────────────────────────────────────
function useFrame(ms = 350) {
  const [f, setF] = useState(0)
  useEffect(() => { const id = setInterval(() => setF(v => v + 1), ms); return () => clearInterval(id) }, [ms])
  return f
}

// ─── Seating Section (10 rows × 10 cols = 100 tiny seats) ────────────────────
function SeatingSection() {
  const frame = useFrame(500)
  const ROWS = 10, COLS = 10
  return (
    <div className="op-seating">
      {Array.from({ length: ROWS }, (_, ri) => (
        <div key={ri} className="op-seat-row" style={{ zIndex: 10 + ri }}>
          {Array.from({ length: COLS }, (_, ci) => {
            const idx = ri * COLS + ci
            const cfg = cfgAt(idx)
            return (
              <div key={ci} className="op-seat-unit">
                <div className="op-seated-char">
                  <MasquCharSprite {...cfg} frame={frame} seated size={0.52} />
                </div>
                <div className="op-chair-mini" aria-hidden="true" />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Photo Browser Modal (card-shuffle on round table) ────────────────────────
function PhotoBrowser({ photos, onClose }) {
  const [idx, setIdx] = useState(0)
  const [shuffleDir, setShuffleDir] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const go = useCallback((dir) => {
    setShuffleDir(dir)
    setAnimKey(k => k + 1)
    setIdx(i => dir === 'right' ? (i + 1) % photos.length : (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go('right')
      else if (e.key === 'ArrowLeft') go('left')
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, onClose])

  // Show prev, current, next as fanned-out cards on a round table surface
  const prevIdx = (idx - 1 + photos.length) % photos.length
  const nextIdx = (idx + 1) % photos.length

  return (
    <div className="overlay" onClick={onClose}>
      <div className="op-pb" onClick={e => e.stopPropagation()}>
        <button className="x" onClick={onClose}>X</button>

        {/* Ticket header */}
        <div className="op-pb-header">
          <div className="op-pb-deco-line" />
          <span className="px op-pb-title">MASQUERADE BALL · PHOTOS</span>
          <div className="op-pb-deco-line" />
        </div>

        {/* Round table surface with fanned cards */}
        <div className="op-pb-table">
          <div className="op-pb-table-surface">
            {/* Prev card (peeking left) */}
            <button className="op-pb-card op-pb-card-prev" onClick={() => go('left')}>
              <img src={B + photos[prevIdx]} alt="" className="op-pb-card-img" loading="lazy" />
            </button>

            {/* Current card (center, bigger) */}
            <div key={animKey}
              className={`op-pb-card op-pb-card-current${shuffleDir === 'right' ? ' op-pb-shuffle-r' : shuffleDir === 'left' ? ' op-pb-shuffle-l' : ''}`}>
              <img src={B + photos[idx]} alt={`Photo ${idx + 1}`} className="op-pb-card-img" />
            </div>

            {/* Next card (peeking right) */}
            <button className="op-pb-card op-pb-card-next" onClick={() => go('right')}>
              <img src={B + photos[nextIdx]} alt="" className="op-pb-card-img" loading="lazy" />
            </button>

            {/* Scattered background cards for depth */}
            <div className="op-pb-scatter s1" aria-hidden="true" />
            <div className="op-pb-scatter s2" aria-hidden="true" />
            <div className="op-pb-scatter s3" aria-hidden="true" />
          </div>
        </div>

        {/* Counter + nav */}
        <div className="op-pb-nav">
          <button className="op-pb-btn" onClick={() => go('left')}>← PREV</button>
          <span className="px op-pb-counter">{String(idx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
          <button className="op-pb-btn" onClick={() => go('right')}>NEXT →</button>
        </div>
        <div className="op-pb-dots">
          {photos.map((_, i) => (
            <button key={i} className={`op-pb-dot${i === idx ? ' on' : ''}`}
              onClick={() => { setShuffleDir(i > idx ? 'right' : 'left'); setAnimKey(k => k + 1); setIdx(i) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Photo Stack on Round Table (small card preview) ──────────────────────────
function PhotoStack({ onOpen }) {
  return (
    <div className="op-pstack-wrap">
      <div className="op-pstack-label px">📸 PHOTO TABLE</div>
      <button className="op-pstack-table" onClick={onOpen} title="Browse the printed photos!">
        {/* Round table */}
        <div className="op-pstack-surface">
          {/* Scattered little card previews with real colors */}
          <div className="op-pstack-card c1"><img src={B + OPENING_PHOTOS[0]} alt="" /></div>
          <div className="op-pstack-card c2"><img src={B + OPENING_PHOTOS[4]} alt="" /></div>
          <div className="op-pstack-card c3"><img src={B + OPENING_PHOTOS[9]} alt="" /></div>
          <div className="op-pstack-card c4"><img src={B + OPENING_PHOTOS[15]} alt="" /></div>
          <div className="op-pstack-card c5"><img src={B + OPENING_PHOTOS[20]} alt="" /></div>
        </div>
        <span className="op-pstack-hint px">TAP TO BROWSE</span>
      </button>
    </div>
  )
}

// ─── Photo Booth (with printing machine + flash) ─────────────────────────────
function PhotoBooth() {
  const frame = useFrame(600)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 180)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="op-booth-area">
      {/* The printing machine in front */}
      <div className="op-printer-wrap">
        <div className={`op-printer${flash ? ' op-printer-flash' : ''}`}>
          <div className="op-printer-body">
            <div className="op-printer-lens" />
            <div className="op-printer-label px">INSTANT<br/>PRINT</div>
          </div>
          {/* Flash effect */}
          {flash && <div className="op-flash-burst" aria-hidden="true" />}
          {/* Printed photo coming out */}
          <div className="op-printer-output">
            <div className="op-printer-photo-out" />
          </div>
        </div>
        {/* People posing in front */}
        <div className="op-booth-posers">
          <div className="op-booth-poser"><MasquCharSprite {...cfgAt(2)} frame={frame} size={0.72} /></div>
          <div className="op-booth-poser"><MasquCharSprite {...cfgAt(6)} frame={frame} size={0.72} /></div>
        </div>
      </div>

      {/* The booth backdrop */}
      <div className="op-booth-wrap">
        <div className="op-booth-label px">📷 PHOTO BOOTH</div>
        <div className="op-booth">
          <div className="op-booth-backdrop">
            <div className="op-booth-curtain-l" aria-hidden="true" />
            <div className="op-booth-curtain-r" aria-hidden="true" />
            <div className="op-booth-mask" aria-hidden="true">
              <svg viewBox="0 0 80 36" width="70" height="30">
                <ellipse cx="40" cy="20" rx="38" ry="16" fill="#1a3a8c" stroke="#c9a84c" strokeWidth="1.5" />
                <ellipse cx="22" cy="18" rx="12" ry="10" fill="#0a1a4a" stroke="#c9a84c" strokeWidth="1" />
                <ellipse cx="58" cy="18" rx="12" ry="10" fill="#0a1a4a" stroke="#c9a84c" strokeWidth="1" />
                <path d="M32 18 Q40 24 48 18" fill="none" stroke="#c9a84c" strokeWidth="1" />
                <path d="M2 20 Q8 10 14 16 Q10 20 6 24 Q4 22 2 20Z" fill="#c9a84c" opacity="0.7" />
                <path d="M78 20 Q72 10 66 16 Q70 20 74 24 Q76 22 78 20Z" fill="#c9a84c" opacity="0.7" />
                <circle cx="40" cy="14" r="2" fill="#c9a84c" />
              </svg>
            </div>
            <div className="op-booth-balloons" aria-hidden="true">
              <span className="op-balloon b1">🎈</span>
              <span className="op-balloon b2">🎈</span>
              <span className="op-balloon b3">🎈</span>
            </div>
          </div>
          {/* People inside booth posing */}
          <div className="op-booth-inside">
            <MasquCharSprite {...cfgAt(9)} frame={frame} size={0.65} />
            <MasquCharSprite {...cfgAt(5)} frame={frame} size={0.65} />
            <MasquCharSprite {...cfgAt(11)} frame={frame} size={0.65} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Man2osha Tables (3 round tables) ────────────────────────────────────────
function ManqoushaTables() {
  const frame = useFrame(500)
  const tables = [
    { items: ['🫓','🫓','☕'], eaters: [0, 3] },
    { items: ['🫓','🫓','🫓'], eaters: [7, 13] },
    { items: ['☕','🫓','🫓'], eaters: [4, 8] },
  ]
  return (
    <div className="op-mq-area">
      <div className="op-mq-area-label px">🫓 MAN2OSHA TABLES</div>
      <div className="op-mq-grid">
        {tables.map((t, ti) => (
          <div key={ti} className="op-mq-unit">
            <div className="op-mq-table-round">
              <div className="op-mq-items-round">
                {t.items.map((item, ii) => (
                  <span key={ii} className="op-mq-item" style={{ animationDelay: (ti * 300 + ii * 200) + 'ms' }}>{item}</span>
                ))}
              </div>
            </div>
            <div className="op-mq-eaters">
              {t.eaters.map((ei, j) => (
                <div key={j} className="op-mq-eater"><MasquCharSprite {...cfgAt(ei)} frame={frame} seated size={0.55} /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stage ────────────────────────────────────────────────────────────────────
function Stage() {
  const frame = useFrame(350)
  return (
    <div className="op-stage">
      <div className="op-stage-platform">
        <div className="op-spotlight op-spot-l" aria-hidden="true" />
        <div className="op-spotlight op-spot-r" aria-hidden="true" />

        <div className="op-stage-banner">
          <div className="op-stage-deco" aria-hidden="true" />
          <span className="px op-stage-title">IEEE 27' MASQUERADE BALL</span>
          <div className="op-stage-deco" aria-hidden="true" />
        </div>

        <div className="op-hosts">
          {/* Hala */}
          <div className="op-host">
            <div className="op-host-tag px">HALA</div>
            <MasquCharSprite {...HOST_STYLES['hala-aboraya']} frame={frame} size={0.9} />
            <span className="op-host-mic">🎤</span>
          </div>

          <div className="op-mic-stand" aria-hidden="true">🎙️</div>

          {/* Tebry */}
          <div className="op-host" style={{ transform: 'scaleX(-1)' }}>
            <div className="op-host-tag px" style={{ transform: 'scaleX(-1)' }}>TEBRY</div>
            <MasquCharSprite {...HOST_STYLES['abdelrahman-tebry']} frame={frame} size={0.9} />
            <span className="op-host-mic">🎤</span>
          </div>
        </div>

        <div className="op-footlights" aria-hidden="true">
          {[...Array(8)].map((_, i) => <span key={i} className="op-footlight" style={{ animationDelay: i * 150 + 'ms' }} />)}
        </div>
      </div>
    </div>
  )
}

// ─── PC Desk (Shahd & Roaa managing projector) ───────────────────────────────
function ProjectorDesk() {
  const frame = useFrame(400)
  return (
    <div className="op-pc-desk">
      <div className="op-pc-label px">🖥️ PROJECTOR CONTROL</div>
      <div className="op-pc-setup">
        {/* Monitor */}
        <div className="op-pc-monitor">
          <div className="op-pc-screen">
            <div className="op-pc-screen-content px">▶ SLIDES</div>
          </div>
          <div className="op-pc-stand" />
        </div>
        {/* Keyboard area */}
        <div className="op-pc-keyboard" />
      </div>
      {/* Shahd & Roaa sitting at the desk */}
      <div className="op-pc-operators">
        <div className="op-pc-op">
          <div className="op-pc-op-label px">SHAHD</div>
          <MasquCharSprite {...HOST_STYLES['shahd-hisham']} frame={frame} seated size={0.6} />
        </div>
        <div className="op-pc-op">
          <div className="op-pc-op-label px">ROAA</div>
          <MasquCharSprite {...HOST_STYLES['roaa-wael']} frame={frame} seated size={0.6} />
        </div>
      </div>
    </div>
  )
}

// ─── Celebration (Youssef thrown + shoulder riders + cameras) ─────────────────
function CelebrationScene() {
  const frame = useFrame(300)
  const [youssefY, setYoussefY] = useState(0)
  const rafRef = useRef(null)
  const t = useRef(0)

  useEffect(() => {
    function loop() {
      t.current += 0.06
      setYoussefY(-Math.abs(Math.sin(t.current)) * 22)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="op-celeb">
      <div className="op-celeb-badge px">🎉 PEAK ENERGY</div>
      <div className="op-celeb-row">
        {/* Camera left */}
        <div className="op-cam-person">
          <span className="op-cam-icon">📹</span>
          <MasquCharSprite {...cfgAt(4)} frame={frame} size={0.65} />
        </div>

        {/* Shoulder rider left */}
        <div className="op-shoulder">
          <div className="op-rider"><MasquCharSprite {...cfgAt(8)} frame={frame} seated size={0.52} /></div>
          <div className="op-carrier"><MasquCharSprite {...cfgAt(5)} frame={frame} size={0.65} /></div>
        </div>

        {/* Youssef thrown */}
        <div className="op-thrown-group">
          <div className="op-thrown-person" style={{ transform: `translateY(${youssefY}px)` }}>
            <div className="op-thrown-crown">👑</div>
            <MasquCharSprite {...HOST_STYLES['youssef-mostafa']} frame={frame} size={0.72} />
            <div className="op-thrown-name px">YOUSSEF</div>
          </div>
          <div className="op-throwers">
            <MasquCharSprite {...cfgAt(0)} frame={frame} size={0.58} />
            <MasquCharSprite {...cfgAt(11)} frame={frame} size={0.58} />
            <MasquCharSprite {...cfgAt(1)} frame={frame} size={0.58} />
          </div>
          <div className="op-thrown-hands px" aria-hidden="true">▲ ▲ ▲</div>
        </div>

        {/* Shoulder rider right */}
        <div className="op-shoulder">
          <div className="op-rider"><MasquCharSprite {...cfgAt(10)} frame={frame} seated size={0.52} /></div>
          <div className="op-carrier"><MasquCharSprite {...cfgAt(14)} frame={frame} size={0.65} /></div>
        </div>

        {/* Camera right */}
        <div className="op-cam-person">
          <MasquCharSprite {...cfgAt(6)} frame={frame} size={0.65} />
          <span className="op-cam-icon">📸</span>
        </div>
      </div>
      <div className="op-celeb-vibe" aria-hidden="true">🎉 🎊 🎉 🎊 🎉</div>
    </div>
  )
}

// ─── Registration Booth (Hana & Seif + queue) ────────────────────────────────
function RegistrationBooth() {
  const frame = useFrame(500)
  return (
    <div className="op-reg">
      <div className="op-reg-label px">📋 REGISTRATION BOOTH</div>
      <div className="op-reg-area">
        {/* The booth desk */}
        <div className="op-reg-desk">
          <div className="op-reg-desk-top">
            <span className="op-reg-clipboard">📋</span>
            <span className="op-reg-clipboard">🖊️</span>
          </div>
          <div className="op-reg-desk-front px">CHECK-IN</div>
        </div>

        {/* Hana & Seif behind */}
        <div className="op-reg-staff">
          <div className="op-reg-person">
            <div className="op-reg-name px">HANA</div>
            <MasquCharSprite {...HOST_STYLES['hana-mohamed']} frame={frame} size={0.7} />
          </div>
          <div className="op-reg-person">
            <div className="op-reg-name px">SEIF</div>
            <MasquCharSprite {...HOST_STYLES['seif-alaa']} frame={frame} size={0.7} />
          </div>
        </div>

        {/* Queue of people registering */}
        <div className="op-reg-queue">
          {[1, 3, 7, 12, 15, 9].map((ci, qi) => (
            <div key={qi} className="op-reg-qperson" style={{ animationDelay: qi * 120 + 'ms' }}>
              <MasquCharSprite {...cfgAt(ci)} frame={frame} size={0.52} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Floating Particles Setup ─────────────────────────────────────────────────
const PARTICLES = [
  { type: 'bat', style: { top: '6%', left: '8%', animationDelay: '0s', animationDuration: '7s' } },
  { type: 'mask', style: { top: '4%', left: '52%', animationDelay: '1.2s', animationDuration: '9s' } },
  { type: 'bat', style: { top: '10%', right: '10%', animationDelay: '2.1s', animationDuration: '8s' } },
  { type: 'sparkle', style: { top: '18%', left: '28%', animationDelay: '0.5s', animationDuration: '5s', fontSize: 16 } },
  { type: 'bat', style: { top: '3%', left: '72%', animationDelay: '3.4s', animationDuration: '10s' } },
  { type: 'star', style: { top: '14%', right: '28%', animationDelay: '1.8s', animationDuration: '6s' } },
  { type: 'mask', style: { top: '5%', left: '88%', animationDelay: '4s', animationDuration: '11s' } },
  { type: 'sparkle', style: { top: '8%', left: '42%', animationDelay: '2.7s', animationDuration: '7s', fontSize: 12 } },
  { type: 'bat', style: { top: '16%', left: '18%', animationDelay: '0.9s', animationDuration: '9s' } },
  { type: 'note', style: { top: '12%', right: '4%', animationDelay: '3.1s', animationDuration: '8s' } },
]

// ─── Main Opening Component ──────────────────────────────────────────────────
export default function Opening() {
  const [photoBrowserOpen, setPhotoBrowserOpen] = useState(false)

  return (
    <div className="op-root">

      {/* Title ticket */}
      <div className="op-title-row">
        <div className="op-title-ticket">
          <div className="op-ticket-deco" aria-hidden="true" />
          <div className="op-title-inner">
            <span className="px op-event-label">IEEE 27' OPENING PARTY</span>
            <h2 className="op-title">MASQUERADE BALL</h2>
            <span className="px op-event-sub">THE NIGHT OF MASKS</span>
          </div>
          <div className="op-ticket-deco" aria-hidden="true" />
          <div className="op-ticket-stub">
            <span className="px op-stub-text">ADMIT<br />ONE</span>
          </div>
        </div>
      </div>

      {/* ═══ THE MAP ═══ */}
      <div className="op-map" role="region" aria-label="Opening Night Map">

        {/* Particles */}
        {PARTICLES.map((p, i) => <FloatingParticle key={i} type={p.type} style={p.style} />)}

        {/* Decorative corners */}
        <div className="op-map-bg" aria-hidden="true">
          <div className="op-corner op-corner-tl" /><div className="op-corner op-corner-tr" />
          <div className="op-corner op-corner-bl" /><div className="op-corner op-corner-br" />
          <div className="op-map-pattern" />
        </div>

        {/* ROW 1: PC Desk | Stage | Celebration */}
        <div className="op-map-row op-row-top">
          <div className="op-map-col">
            <ProjectorDesk />
          </div>
          <div className="op-map-col op-col-stage">
            <Stage />
          </div>
          <div className="op-map-col">
            <CelebrationScene />
          </div>
        </div>

        {/* ROW 2: Man2osha | Seating | Photo Booth + Table */}
        <div className="op-map-row op-row-mid">
          <div className="op-map-col">
            <ManqoushaTables />
          </div>
          <div className="op-map-col op-col-seats">
            <div className="op-seating-wrap">
              <div className="op-seating-label px">🪑 ATTENDEES (~100)</div>
              <SeatingSection />
              <div className="op-map-floor" aria-hidden="true">
                {[...Array(16)].map((_, i) => <span key={i} className="op-floor-tile" style={{ '--oti': i }} />)}
              </div>
            </div>
          </div>
          <div className="op-map-col">
            <PhotoBooth />
            <PhotoStack onOpen={() => setPhotoBrowserOpen(true)} />
          </div>
        </div>

        {/* Aisle */}
        <div className="op-aisle"><span className="op-aisle-arr px" aria-hidden="true">▼  ▼  ▼</span></div>

        {/* ROW 3: Registration */}
        <div className="op-map-row op-row-bot">
          <RegistrationBooth />
        </div>
      </div>

      {/* Photo Browser */}
      {photoBrowserOpen && <PhotoBrowser photos={OPENING_PHOTOS} onClose={() => setPhotoBrowserOpen(false)} />}
    </div>
  )
}
