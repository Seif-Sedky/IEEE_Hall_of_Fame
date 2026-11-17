import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import members from '../data/members.json'

const B = import.meta.env.BASE_URL
const byId = Object.fromEntries(members.map(m => [m.id, m]))

// All opening photos (1–27)
const OPENING_PHOTOS = Array.from({ length: 27 }, (_, i) => `opening/${i + 1}.jpg`)

// ─── Named Character Role Profiles ──────────────────────────────────────────
const ROLE_PROFILES = {
  'hala-aboraya': {
    openingRole: 'NIGHT HOST / MC 🎤',
    openingDesc: 'Co-hosted the Masquerade Ball alongside Tebry, electrifying the ballroom with charisma and keeping the entire crowd hyped all night long! (She lost her voice in the process)',
    badgeColor: '#c9a84c',
  },
  'abdelrahman-tebry': {
    openingRole: 'NIGHT HOST / MC 🎙️',
    openingDesc: 'Co-hosted the night with Hala, commanding the mic with jokes and stage presence, leading all the ceremonies and crowd games!',
    badgeColor: '#3888e8',
  },
  'youssef-mostafa': {
    openingRole: 'PRESIDENT · THE TOSS 👑',
    openingDesc: 'Our President who was hoisted up into the air and tossed repeatedly by cheering members in an iconic moment of pure chapter joy and energy!',
    badgeColor: '#f8a808',
  },
  'shahd-hisham': {
    openingRole: 'PROJECTOR & VISUALS LEAD 🖥️',
    openingDesc: 'Stationed at the control laptop desk with Roaa, directing visuals, cueing presentation slides, and keeping the big screen perfectly synced!',
    badgeColor: '#3888e8',
  },
  'roaa-wael': {
    openingRole: 'PROJECTOR & VISUALS LEAD 💻',
    openingDesc: 'Managed the technical projector station alongside Shahd, operating slides and videos that lit up the stage backdrop all evening!',
    badgeColor: '#c41535',
  },
  'hana-mohamed': {
    openingRole: 'REGISTRATION & WELCOME LEAD 📋',
    openingDesc: 'Welcomed arriving guests at the silver registration booth with Saif, checking tickets, managing the guest list, and handing out masquerade masks!',
    badgeColor: '#c9a84c',
  },
  'saif-abdelaziz': {
    openingRole: 'REGISTRATION & WELCOME LEAD 🖊️',
    openingDesc: 'Manned the silvery check-in counter with Hana, coordinating the attendees arrivals and checking in guests as they arrived!',
    badgeColor: '#58a0b0',
  },
}

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
    '.AAMMMMMSAA.',
    '.AA.M..M.AA.',
    '..AASSSSAA..',
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
  moving = false, size = 1 }) {

  const hairRows = MASKED_ARCHETYPES[archetype] || MASKED_ARCHETYPES.short
  const isHijab = archetype === 'hijab'
  const isLong = archetype === 'long'

  // Legs rule: unless moving === true, legs stay strictly planted (no fidgeting/marching in place)
  const legRows = seated
    ? [
      '..PP....PP..',
      '..PP....PP..',
    ]
    : moving && (frame % 2 !== 0)
      ? [
        '..PPPPPPPP..',
        '...PPPPPP...',
        '....PPPP....',
        '...BB..BB...',
        '...BB..BB...',
      ]
      : [
        '..PP....PP..',
        '.PP......PP.',
        '.PP......PP.',
        'BB........BB',
        'BB........BB',
      ]

  const rows = [
    hairRows[0], hairRows[1], hairRows[2], hairRows[3], hairRows[4],
    isHijab ? '..AASSSSAA..' : '....SSSS....',
    isLong ? '.HHTTTTTTHH.' : isHijab ? '.AATTTTTTAA.' : '.TTTTTTTTTT.',
    isLong ? '.HHTTTTTTHH.' : '.TTTTTTTTTT.',
    '..TTTTTTTT..', '..PPPPPPPP..',
    ...legRows,
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

// ─── Character config pool for attendees ──────────────────────────────────────
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
  'saif-abdelaziz': { archetype: 'short', skinColor: '#f5c396', hairColor: '#1a110b', maskColor: '#d35400', shirtColor: '#1a1a2e', shoesColor: '#c9a84c' },
}

// ─── useFrame helper ─────────────────────────────────────────────────────────
function useFrame(ms = 350) {
  const [f, setF] = useState(0)
  useEffect(() => { const id = setInterval(() => setF(v => v + 1), ms); return () => clearInterval(id) }, [ms])
  return f
}

// ─── VIP Member Profile Popup Modal ──────────────────────────────────────────
function MemberProfileModal({ memberId, onClose }) {
  const member = byId[memberId]
  const profile = ROLE_PROFILES[memberId]
  if (!member || !profile) return null

  return (
    <div className="overlay" onClick={onClose}>
      <div className="op-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="x" onClick={onClose}>X</button>

        {/* Masquerade Gold Header */}
        <div className="op-pm-header">
          <div className="op-pm-header-deco" />
          <span className="px op-pm-header-tag">MASQUERADE VIP · PROFILE</span>
          <div className="op-pm-header-deco" />
        </div>

        <div className="op-pm-body">
          {/* Photo with golden frame */}
          <div className="op-pm-photo-wrap">
            <img src={B + member.photo} alt={member.name} className="op-pm-photo" />
            <span className="op-pm-mask-badge" aria-hidden="true">🎭</span>
          </div>

          <div className="op-pm-info">
            <h3 className="op-pm-name hand">{member.name}</h3>
            <p className="op-pm-role px">{member.role}</p>

            {/* Special Opening Night Badge */}
            <div className="op-pm-event-badge" style={{ '--bc': profile.badgeColor }}>
              <span className="px op-pm-event-label">OPENING NIGHT ROLE</span>
              <strong className="px op-pm-event-title">{profile.openingRole}</strong>
            </div>
          </div>
        </div>

        {/* Opening Role Story */}
        <div className="op-pm-story">
          <p className="op-pm-story-text hand">{profile.openingDesc}</p>
        </div>

        {/* Quote if available */}
        {member.statement && (
          <div className="op-pm-quote-box">
            <span className="op-pm-quote-mark">“</span>
            <p className="op-pm-quote hand">{member.statement}</p>
          </div>
        )}

        {/* Ticket Footer */}
        <div className="op-pm-footer px">
          <span>🎟️ IEEE 27' OPENING PARTY</span>
          <span>MASQUERADE BALL</span>
        </div>
      </div>
    </div>
  )
}

// ─── Seating Section (10 rows × 10 cols = 100 seats) ─────────────────────────
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

// ─── Photo Corner (Booth + Table with Continuous Swap Loop) ──────────────────
function PhotoCorner({ onOpen }) {
  const frame = useFrame(380)
  const [cycle, setCycle] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let tFlash, tFlashOff, tWalk, tArrive

    function runCycle() {
      // 1. Flash bursts at 2800ms
      tFlash = setTimeout(() => {
        setFlash(true)
        tFlashOff = setTimeout(() => setFlash(false), 240)
      }, 2800)

      // 2. Posers leave and 2 table attendees swap at 3400ms
      tWalk = setTimeout(() => {
        setIsMoving(true)
        setCycle(c => c + 1)
        // 3. Arrive after 2000ms transition
        tArrive = setTimeout(() => {
          setIsMoving(false)
        }, 2000)
      }, 3400)
    }

    runCycle()
    const interval = setInterval(runCycle, 5600)

    return () => {
      clearInterval(interval)
      clearTimeout(tFlash)
      clearTimeout(tFlashOff)
      clearTimeout(tWalk)
      clearTimeout(tArrive)
    }
  }, [])

  // 8 Slot Coordinates within the PhotoCorner container:
  // Slots 0 & 1: Photo Booth posers (in front of backdrop)
  // Slots 2 & 3: Table Top
  // Slots 4 & 5: Table Middle (Sides)
  // Slots 6 & 7: Table Bottom
  const SLOTS = useMemo(() => [
    { top: 28, left: 34, zIndex: 3, flip: false, isBooth: true },
    { top: 28, left: 54, zIndex: 3, flip: true, isBooth: true },
    { top: 168, left: 16, zIndex: 4, flip: false, isBooth: false },
    { top: 168, left: 72, zIndex: 4, flip: true, isBooth: false },
    { top: 215, left: 8, zIndex: 5, flip: false, isBooth: false },
    { top: 215, left: 80, zIndex: 5, flip: true, isBooth: false },
    { top: 268, left: 20, zIndex: 6, flip: false, isBooth: false },
    { top: 268, left: 68, zIndex: 6, flip: true, isBooth: false },
  ], [])

  const CORNER_ATTENDEES = useMemo(() => [
    { id: 0, cfg: cfgAt(0) },
    { id: 1, cfg: cfgAt(2) },
    { id: 2, cfg: cfgAt(5) },
    { id: 3, cfg: cfgAt(6) },
    { id: 4, cfg: cfgAt(9) },
    { id: 5, cfg: cfgAt(11) },
    { id: 6, cfg: cfgAt(13) },
    { id: 7, cfg: cfgAt(14) },
  ], [])

  return (
    <div className="op-photo-corner">
      <div className="op-corner-header px">📸 PHOTO BOOTH & PRINTS</div>

      {/* ── 1. The Booth Backdrop at top ── */}
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

      {/* ── 2. The Instant Camera / Printer facing posers ── */}
      <div className="op-printer-center">
        <div className={`op-printer${flash ? ' op-printer-flash' : ''}`}>
          <div className="op-printer-body">
            <div className="op-printer-lens" />
            <div className="op-printer-label px">INSTANT<br />PRINT</div>
          </div>
          {flash && <div className="op-flash-burst" aria-hidden="true" />}
          <div className="op-printer-output">
            <div className="op-printer-photo-out" />
          </div>
        </div>
      </div>

      {/* ── 3. The Round Table with printed photos (Clickable) ── */}
      <div className="op-corner-table-anchor">
        <button className="op-pstack-table" onClick={onOpen} title="Browse the printed photos!">
          <div className="op-pstack-surface">
            <div className="op-pstack-card c1"><img src={B + OPENING_PHOTOS[0]} alt="" /></div>
            <div className="op-pstack-card c2"><img src={B + OPENING_PHOTOS[4]} alt="" /></div>
            <div className="op-pstack-card c3"><img src={B + OPENING_PHOTOS[9]} alt="" /></div>
            <div className="op-pstack-card c4"><img src={B + OPENING_PHOTOS[15]} alt="" /></div>
            <div className="op-pstack-card c5"><img src={B + OPENING_PHOTOS[20]} alt="" /></div>
          </div>
          <span className="op-pstack-hint px">TAP TO BROWSE</span>
        </button>
      </div>

      {/* ── 4. The 8 Characters (Continuous swap between Booth & Table) ── */}
      {CORNER_ATTENDEES.map((att, i) => {
        const slotIdx = (i + 2 * cycle) % 8
        const slot = SLOTS[slotIdx]
        return (
          <div
            key={att.id}
            className="op-corner-attendee"
            style={{
              position: 'absolute',
              top: `${slot.top}px`,
              left: `${slot.left}%`,
              transform: `translate(-50%, 0) scaleX(${slot.flip ? -1 : 1})`,
              transition: 'top 2s ease-in-out, left 2s ease-in-out',
              zIndex: slot.zIndex,
            }}
            title={slot.isBooth ? 'Posing for photo' : 'Browsing photos at table'}
          >
            <MasquCharSprite
              {...att.cfg}
              frame={frame}
              moving={isMoving}
              size={slot.isBooth ? 0.65 : 0.54}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Man2osha Tables (3 round tables - surrounded by eaters + bounded walkers)
function ManqoushaTables() {
  const frame = useFrame(400)
  const [walkerPhase, setWalkerPhase] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setWalkerPhase(p => (p + 1) % 4), 3600)
    return () => clearInterval(id)
  }, [])

  // Walker 1 (pacing vertically between Table 1 & 2): 0=stop T1, 1=walk down, 2=stop T2, 3=walk up
  const w1Walking = walkerPhase === 1 || walkerPhase === 3
  const w1Y = (walkerPhase === 1 || walkerPhase === 2) ? 42 : 0

  // Walker 2 (pacing vertically between Table 2 & 3): 0=walk down, 1=stop T3, 2=walk up, 3=stop T2
  const w2Walking = walkerPhase === 0 || walkerPhase === 2
  const w2Y = (walkerPhase === 0 || walkerPhase === 1) ? 42 : 0

  // Walker 3 (pacing horizontally in mingler corridor): -20px <-> +20px
  const w3Walking = walkerPhase === 1 || walkerPhase === 3
  const w3X = (walkerPhase === 1 || walkerPhase === 2) ? 20 : -20

  // Walker 4 (pacing horizontally in opposite direction): +16px <-> -16px
  const w4Walking = walkerPhase === 0 || walkerPhase === 2
  const w4X = (walkerPhase === 0 || walkerPhase === 1) ? -16 : 16

  const tables = [
    {
      items: ['🫓', '🫓', '☕', '🫓'],
      topEaters: [0, 6, 12],
      sideLeft: 3,
      sideRight: 14,
      bottomEaters: [1, 8, 15],
    },
    {
      items: ['🫓', '☕', '🫓', '🫓'],
      topEaters: [7, 2, 9],
      sideLeft: 13,
      sideRight: 10,
      bottomEaters: [4, 12, 5],
    },
    {
      items: ['☕', '🫓', '🫓', '☕'],
      topEaters: [5, 11, 1],
      sideLeft: 9,
      sideRight: 15,
      bottomEaters: [3, 7, 10],
    },
  ]

  return (
    <div className="op-mq-area">
      <div className="op-mq-area-label px">🫓 MAN2OSHA TABLES</div>
      <div className="op-mq-grid">
        {tables.map((t, ti) => (
          <div key={ti} className="op-mq-unit-surround">
            {/* Top eaters standing behind table (planted legs) */}
            <div className="op-mq-top-eaters">
              {t.topEaters.map((ei, j) => (
                <div key={j} className="op-mq-eater" title="Eating man2osha">
                  <MasquCharSprite {...cfgAt(ei)} frame={frame} moving={false} size={0.48} />
                </div>
              ))}
            </div>

            {/* Middle row: Left eater - Table - Right eater */}
            <div className="op-mq-middle-row">
              <div className="op-mq-eater side" title="Eating man2osha">
                <MasquCharSprite {...cfgAt(t.sideLeft)} frame={frame} moving={false} size={0.48} />
              </div>

              <div className="op-mq-table-round">
                <div className="op-mq-items-round">
                  {t.items.map((item, ii) => (
                    <span key={ii} className="op-mq-item" style={{ animationDelay: (ti * 250 + ii * 180) + 'ms' }}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="op-mq-eater side" title="Drinking tea" style={{ transform: 'scaleX(-1)' }}>
                <MasquCharSprite {...cfgAt(t.sideRight)} frame={frame} moving={false} size={0.48} />
              </div>
            </div>

            {/* Bottom eaters in front of table (planted legs) */}
            <div className="op-mq-bottom-eaters">
              {t.bottomEaters.map((ei, j) => (
                <div key={j} className="op-mq-eater" title="Eating man2osha">
                  <MasquCharSprite {...cfgAt(ei)} frame={frame} seated moving={false} size={0.46} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bounded Active Walkers moving between food tables */}
      <div className="op-mq-walkers-row" aria-hidden="true">
        <div
          className="op-mq-walker"
          style={{
            transform: `translateY(${w1Y}px)`,
            transition: 'transform 2s ease-in-out',
          }}
          title="Fetching man2osha"
        >
          <MasquCharSprite {...cfgAt(2)} frame={frame} moving={w1Walking} size={0.5} />
          <span className="op-mq-walker-prop">🫓</span>
        </div>

        <div
          className="op-mq-walker"
          style={{
            transform: `translateY(${w2Y}px)`,
            transition: 'transform 2s ease-in-out',
          }}
          title="Carrying tea"
        >
          <MasquCharSprite {...cfgAt(8)} frame={frame} moving={w2Walking} size={0.5} />
          <span className="op-mq-walker-prop">☕</span>
        </div>
      </div>

      {/* Mingling crowd with bounded horizontal walkers & socializers */}
      <div className="op-mq-crowd">
        <div
          className="op-mq-mingler op-mq-corridor-walker"
          style={{
            transform: `translateX(${w3X}px) scaleX(${w3Walking && w3X > 0 ? 1 : -1})`,
            transition: 'transform 2s ease-in-out',
          }}
          title="Socializing"
        >
          <MasquCharSprite {...cfgAt(4)} frame={frame} moving={w3Walking} size={0.5} />
          <span className="op-mq-mingler-food">🫓</span>
        </div>

        <div className="op-mq-mingler">
          <MasquCharSprite {...cfgAt(10)} frame={frame} moving={false} size={0.5} />
          <span className="op-mq-mingler-food">☕</span>
        </div>

        <div
          className="op-mq-mingler op-mq-corridor-walker"
          style={{
            transform: `translateX(${w4X}px) scaleX(${w4Walking && w4X > 0 ? 1 : -1})`,
            transition: 'transform 2s ease-in-out',
          }}
          title="Socializing"
        >
          <MasquCharSprite {...cfgAt(14)} frame={frame} moving={w4Walking} size={0.5} />
          <span className="op-mq-mingler-food">☕</span>
        </div>

        <div className="op-mq-mingler">
          <MasquCharSprite {...cfgAt(7)} frame={frame} moving={false} size={0.5} />
          <span className="op-mq-mingler-food">🫓</span>
        </div>
      </div>
    </div>
  )
}

// ─── Stage (Hala & Tebry - Clickable & Pacing Stage Halves) ───────────────────
function Stage({ onSelectProfile }) {
  const frame = useFrame(350)
  const [halaPhase, setHalaPhase] = useState(0)
  const [tebryPhase, setTebryPhase] = useState(0)

  useEffect(() => {
    const idH = setInterval(() => setHalaPhase(p => (p + 1) % 4), 3800)
    const idT = setInterval(() => setTebryPhase(p => (p + 1) % 4), 3400)
    return () => {
      clearInterval(idH)
      clearInterval(idT)
    }
  }, [])

  // Hala: 0 = at mic (speaking), 1 = walk left, 2 = at wing (hyping), 3 = walk right (back to mic)
  const halaWalking = halaPhase === 1 || halaPhase === 3
  const halaX = (halaPhase === 1 || halaPhase === 2) ? -28 : 0
  const halaFlip = halaPhase === 1

  // Tebry: 0 = at wing (hyping), 1 = walk left (to mic), 2 = at mic (speaking), 3 = walk right (to wing)
  const tebryWalking = tebryPhase === 1 || tebryPhase === 3
  const tebryX = (tebryPhase === 0 || tebryPhase === 3) ? 28 : 0
  const tebryFlip = tebryPhase === 3

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
          <div
            className="op-host-pos-wrap"
            style={{
              transform: `translateX(${halaX}px)`,
              transition: 'transform 2s ease-in-out',
            }}
          >
            <button
              className="op-char-btn op-host-btn"
              onClick={() => onSelectProfile('hala-aboraya')}
              title="Click to view Hala's profile!"
              style={{ transform: `scaleX(${halaFlip ? -1 : 1})` }}
            >
              <div className="op-host-tag px" style={{ transform: `scaleX(${halaFlip ? -1 : 1})` }}>HALA 🔍</div>
              <MasquCharSprite {...HOST_STYLES['hala-aboraya']} frame={frame} moving={halaWalking} size={0.9} />
              <span className="op-host-mic">🎤</span>
            </button>
          </div>

          <div className="op-mic-stand" aria-hidden="true">🎙️</div>

          {/* Tebry */}
          <div
            className="op-host-pos-wrap"
            style={{
              transform: `translateX(${tebryX}px)`,
              transition: 'transform 2s ease-in-out',
            }}
          >
            <button
              className="op-char-btn op-host-btn"
              onClick={() => onSelectProfile('abdelrahman-tebry')}
              title="Click to view Tebry's profile!"
              style={{ transform: `scaleX(${tebryFlip ? 1 : -1})` }}
            >
              <div className="op-host-tag px" style={{ transform: `scaleX(${tebryFlip ? 1 : -1})` }}>TEBRY 🔍</div>
              <MasquCharSprite {...HOST_STYLES['abdelrahman-tebry']} frame={frame} moving={tebryWalking} size={0.9} />
              <span className="op-host-mic">🎤</span>
            </button>
          </div>
        </div>

        <div className="op-footlights" aria-hidden="true">
          {[...Array(8)].map((_, i) => <span key={i} className="op-footlight" style={{ animationDelay: i * 150 + 'ms' }} />)}
        </div>
      </div>
    </div>
  )
}

// ─── PC Desk (Shahd & Roaa - Clickable) ───────────────────────────────────────
function ProjectorDesk({ onSelectProfile }) {
  const frame = useFrame(400)
  return (
    <div className="op-pc-desk">
      <div className="op-pc-label px">🖥️ PROJECTOR CONTROL</div>
      <div className="op-pc-setup">
        <div className="op-pc-monitor">
          <div className="op-pc-screen">
            <div className="op-pc-screen-content px">▶ SLIDES</div>
          </div>
          <div className="op-pc-stand" />
        </div>
        <div className="op-pc-keyboard" />
      </div>
      <div className="op-pc-operators">
        <button className="op-char-btn" onClick={() => onSelectProfile('shahd-hisham')} title="Click to view Shahd's profile!">
          <div className="op-pc-op-label px">SHAHD 🔍</div>
          <MasquCharSprite {...HOST_STYLES['shahd-hisham']} frame={frame} seated moving={false} size={0.62} />
        </button>
        <button className="op-char-btn" onClick={() => onSelectProfile('roaa-wael')} title="Click to view Roaa's profile!">
          <div className="op-pc-op-label px">ROAA 🔍</div>
          <MasquCharSprite {...HOST_STYLES['roaa-wael']} frame={frame} seated moving={false} size={0.62} />
        </button>
      </div>
    </div>
  )
}

// ─── Celebration (Youssef thrown + moving cameras & dancers) ─────────────────
function CelebrationScene({ onSelectProfile }) {
  const frame = useFrame(300)
  const [youssefY, setYoussefY] = useState(0)
  const [camPhase, setCamPhase] = useState(0)
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

  useEffect(() => {
    const id = setInterval(() => setCamPhase(p => (p + 1) % 4), 2800)
    return () => clearInterval(id)
  }, [])

  // Camera Left: moves between -14px and +8px
  const camLWalking = camPhase === 1 || camPhase === 3
  const camLX = (camPhase === 1 || camPhase === 2) ? -14 : 8

  // Camera Right: moves between +14px and -8px
  const camRWalking = camPhase === 0 || camPhase === 2
  const camRX = (camPhase === 0 || camPhase === 1) ? 14 : -8

  // Dance sway for shoulder riders
  const danceStep = frame % 4
  const danceX = danceStep === 1 ? -4 : danceStep === 3 ? 4 : 0

  return (
    <div className="op-celeb">
      <div className="op-celeb-row">
        {/* Camera left (pacing back and forth) */}
        <div
          className="op-cam-person"
          style={{
            transform: `translateX(${camLX}px) scaleX(${camLWalking && camLX > 0 ? -1 : 1})`,
            transition: 'transform 1.8s ease-in-out',
          }}
        >
          <span className="op-cam-icon">📹</span>
          <MasquCharSprite {...cfgAt(4)} frame={frame} moving={camLWalking} size={0.65} />
        </div>

        {/* Shoulder rider left (dancing around) */}
        <div
          className="op-shoulder"
          style={{
            transform: `translateX(${danceX}px)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <div className="op-rider"><MasquCharSprite {...cfgAt(8)} frame={frame} seated moving={false} size={0.52} /></div>
          <div className="op-carrier"><MasquCharSprite {...cfgAt(5)} frame={frame} moving={true} size={0.65} /></div>
        </div>

        {/* Youssef thrown (Clickable) */}
        <div className="op-thrown-group">
          <button className="op-char-btn op-thrown-btn" onClick={() => onSelectProfile('youssef-mostafa')}
            title="Click to view Youssef's profile!" style={{ transform: `translateY(${youssefY}px)` }}>
            <div className="op-thrown-crown">👑</div>
            <MasquCharSprite {...HOST_STYLES['youssef-mostafa']} frame={frame} moving={false} size={0.72} />
            <div className="op-thrown-name px">YOUSSEF 🔍</div>
          </button>
          <div className="op-throwers">
            <MasquCharSprite {...cfgAt(0)} frame={frame} moving={false} size={0.58} />
            <MasquCharSprite {...cfgAt(11)} frame={frame} moving={false} size={0.58} />
            <MasquCharSprite {...cfgAt(1)} frame={frame} moving={false} size={0.58} />
          </div>
          <div className="op-thrown-hands px" aria-hidden="true">▲ ▲ ▲</div>
        </div>

        {/* Shoulder rider right (dancing around) */}
        <div
          className="op-shoulder"
          style={{
            transform: `translateX(${-danceX}px)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <div className="op-rider"><MasquCharSprite {...cfgAt(10)} frame={frame} seated moving={false} size={0.52} /></div>
          <div className="op-carrier"><MasquCharSprite {...cfgAt(14)} frame={frame} moving={true} size={0.65} /></div>
        </div>

        {/* Camera right (pacing back and forth) */}
        <div
          className="op-cam-person"
          style={{
            transform: `translateX(${camRX}px) scaleX(${camRWalking && camRX > 0 ? 1 : -1})`,
            transition: 'transform 1.8s ease-in-out',
          }}
        >
          <MasquCharSprite {...cfgAt(6)} frame={frame} moving={camRWalking} size={0.65} />
          <span className="op-cam-icon">📸</span>
        </div>
      </div>
      <div className="op-celeb-vibe" aria-hidden="true">🎉 🎊 🎉 🎊 🎉</div>
    </div>
  )
}

// ─── Registration Booth (Hana & Seif BEHIND white silvery booth) ─────────────
function RegistrationBooth({ onSelectProfile }) {
  const frame = useFrame(500)
  return (
    <div className="op-reg">
      <div className="op-reg-label px">📋 REGISTRATION & CHECK-IN BOOTH</div>
      <div className="op-reg-area">

        {/* 1. Hana & Saif standing BEHIND the desk */}
        <div className="op-reg-staff-behind">
          <button className="op-char-btn op-staff-btn" onClick={() => onSelectProfile('hana-mohamed')} title="Click to view Hana's profile!">
            <div className="op-staff-name-tag px">HANA 🔍</div>
            <MasquCharSprite {...HOST_STYLES['hana-mohamed']} frame={frame} size={0.72} />
          </button>
          <button className="op-char-btn op-staff-btn" onClick={() => onSelectProfile('saif-abdelaziz')} title="Click to view Saif's profile!">
            <div className="op-staff-name-tag px">SAIF 🔍</div>
            <MasquCharSprite {...HOST_STYLES['saif-abdelaziz']} frame={frame} size={0.72} />
          </button>
        </div>

        {/* 2. White Silvery Metallic Registration Desk in FRONT of them */}
        <div className="op-reg-silver-desk">
          <div className="op-silver-desk-top">
            <span className="op-desk-prop">🎭</span>
            <span className="op-desk-prop">📋</span>
            <span className="op-silver-desk-title px">WELCOME · CHECK-IN</span>
            <span className="op-desk-prop">🖊️</span>
            <span className="op-desk-prop">✨</span>
          </div>
          <div className="op-silver-desk-body">
            <div className="op-silver-crest px">✦ IEEE 27' MASQUERADE BALL ✦</div>
          </div>
        </div>

        {/* 3. Queue of attendees waiting IN FRONT of the desk */}
        <div className="op-reg-front-queue">
          <span className="op-queue-tag px">GUESTS ARRIVING ▼</span>
          <div className="op-reg-queue-line">
            {[1, 3, 7, 12, 15, 9, 4, 10].map((ci, qi) => (
              <div key={qi} className="op-reg-qperson" style={{ animationDelay: qi * 120 + 'ms' }}>
                <MasquCharSprite {...cfgAt(ci)} frame={frame} size={0.52} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Floating Particles ───────────────────────────────────────────────────────
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
  const [selectedProfile, setSelectedProfile] = useState(null)

  // Turn on masquerade theme on the entire body background while in Opening section
  useEffect(() => {
    document.body.classList.add('masquerade-theme')
    return () => {
      document.body.classList.remove('masquerade-theme')
    }
  }, [])

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

        {/* Disco Ball in Ceiling */}
        <div className="op-disco-ball-wrap" aria-hidden="true">
          <div className="op-disco-wire" />
          <div className="op-disco-ball">🪩</div>
          <div className="op-disco-shimmer" />
        </div>

        {/* Arena Disco Lights popping and sweeping */}
        <div className="op-disco-lights" aria-hidden="true">
          <span className="op-disco-spot ds-pink" style={{ top: '22%', left: '12%' }} />
          <span className="op-disco-spot ds-cyan" style={{ top: '32%', right: '16%' }} />
          <span className="op-disco-spot ds-gold" style={{ top: '52%', left: '48%' }} />
          <span className="op-disco-spot ds-purple" style={{ top: '18%', left: '55%' }} />
          <span className="op-disco-spot ds-blue" style={{ top: '68%', right: '10%' }} />
          <span className="op-disco-spot ds-magenta" style={{ top: '64%', left: '20%' }} />
          <div className="op-disco-beam beam-l" />
          <div className="op-disco-beam beam-r" />
          <div className="op-disco-beam beam-c" />
        </div>

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
            <ProjectorDesk onSelectProfile={setSelectedProfile} />
          </div>
          <div className="op-map-col op-col-stage">
            <Stage onSelectProfile={setSelectedProfile} />
          </div>
          <div className="op-map-col">
            <CelebrationScene onSelectProfile={setSelectedProfile} />
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
            <PhotoCorner onOpen={() => setPhotoBrowserOpen(true)} />
          </div>
        </div>

        {/* Aisle */}
        <div className="op-aisle"><span className="op-aisle-arr px" aria-hidden="true">▼  ▼  ▼</span></div>

        {/* ROW 3: Registration Booth (Hana & Seif) */}
        <div className="op-map-row op-row-bot">
          <RegistrationBooth onSelectProfile={setSelectedProfile} />
        </div>
      </div>

      {/* Photo Browser Modal */}
      {photoBrowserOpen && <PhotoBrowser photos={OPENING_PHOTOS} onClose={() => setPhotoBrowserOpen(false)} />}

      {/* Member Profile Popup Modal */}
      {selectedProfile && (
        <MemberProfileModal
          memberId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  )
}
