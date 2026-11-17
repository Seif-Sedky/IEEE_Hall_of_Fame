import { useState, useEffect, useRef, useCallback } from 'react'
import members from '../data/members.json'

const B = import.meta.env.BASE_URL
const byId = Object.fromEntries(members.map(m => [m.id, m]))

// All opening photos (1–27)
const OPENING_PHOTOS = Array.from({ length: 27 }, (_, i) => `opening/${i + 1}.jpg`)

// ─── Floating Particle (bat / mask / sparkle) ─────────────────────────────────
function FloatingParticle({ type, style }) {
  const icons = { bat: '🦇', mask: '🎭', sparkle: '✦', star: '★', note: '♪' }
  return (
    <span className="op-particle" style={style} aria-hidden="true">
      {icons[type] || '✦'}
    </span>
  )
}

// ─── Pixel Masquerade Character (masked, formal) ──────────────────────────────
// Tokens: H=Hair, S=Skin, E=Eye, M=Mask, T=Shirt, P=Pants, B=Shoes, A=Accessory
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
}

function MasquCharSprite({ archetype = 'short', skinColor = '#f5c396', hairColor = '#1a110b',
  maskColor = '#1a3a8c', shirtColor = '#181020', pantsColor = '#1a1a2e',
  shoesColor = '#c9a84c', accessoryColor = '#c9a84c', frame = 0, seated = false }) {

  const hairRows = MASKED_ARCHETYPES[archetype] || MASKED_ARCHETYPES.short
  const isHijab = archetype === 'hijab'
  const isLong = archetype === 'long'

  const rows = seated ? [
    hairRows[0],
    hairRows[1],
    hairRows[2],
    hairRows[3],
    hairRows[4],
    isHijab ? '..AAAAAAAA..' : '....SSSS....',
    isLong ? '.HHTTTTTTHH.' : isHijab ? '.AATTTTTTAA.' : '.TTTTTTTTTT.',
    isLong ? '.HHTTTTTTHH.' : '.TTTTTTTTTT.',
    '..TTTTTTTT..',
    '..PPPPPPPP..',
    '..PP....PP..',
    '..PP....PP..',
  ] : [
    hairRows[0],
    hairRows[1],
    hairRows[2],
    hairRows[3],
    hairRows[4],
    isHijab ? '..AAAAAAAA..' : '....SSSS....',
    isLong ? '.HHTTTTTTHH.' : isHijab ? '.AATTTTTTAA.' : '.TTTTTTTTTT.',
    isLong ? '.HHTTTTTTHH.' : '.TTTTTTTTTT.',
    '..TTTTTTTT..',
    '..PPPPPPPP..',
    ...(frame % 2 === 0
      ? ['..PP....PP..', '.PP......PP.', '.PP......PP.', 'BB........BB', 'BB........BB']
      : ['..PPPPPPPP..', '...PPPPPP...', '....PPPP....', '...BB..BB...', '...BB..BB...']),
  ]

  const colorMap = {
    H: hairColor, S: skinColor, E: '#c9a84c',
    M: maskColor, T: shirtColor, P: pantsColor,
    B: shoesColor, A: accessoryColor, C: '#1a110b',
  }

  const W = 12, H_px = seated ? 12 : 15
  return (
    <svg
      width={seated ? 30 : 34}
      height={seated ? 36 : 42}
      viewBox={`0 0 ${W} ${H_px}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = colorMap[char]
          if (!fill) return null
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
        })
      )}
    </svg>
  )
}

// ─── Character configs for the masked attendees ───────────────────────────────
const ATTENDEE_CONFIGS = [
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
]

// ─── Seated Section (rows of chairs + attendees) ──────────────────────────────
function SeatingSection() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 400)
    return () => clearInterval(id)
  }, [])

  // 3 rows × 4 seats = 12 seats
  const rows = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
  ]

  return (
    <div className="op-seating">
      {rows.map((row, ri) => (
        <div key={ri} className="op-seat-row" style={{ zIndex: 10 + ri }}>
          {row.map((idx) => {
            const cfg = ATTENDEE_CONFIGS[idx]
            return (
              <div key={idx} className="op-seat-unit">
                {/* Character */}
                <div className="op-seated-char">
                  <MasquCharSprite {...cfg} frame={frame} seated />
                </div>
                {/* Chair */}
                <div className="op-chair" aria-hidden="true">
                  <div className="op-chair-back" />
                  <div className="op-chair-seat" />
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Photo Stack (the printed photos table) ───────────────────────────────────
function PhotoStack({ onOpen }) {
  return (
    <div className="op-photo-table-wrap">
      <div className="op-photo-table-label px">📸 PRINTED PHOTOS</div>
      <div className="op-photo-table">
        {/* Table legs */}
        <div className="op-pt-legs"><span /><span /></div>
        {/* Stack of photos */}
        <button className="op-photo-stack" onClick={onOpen} title="Browse the photos!">
          <div className="op-stack-card op-stack-c3" aria-hidden="true" />
          <div className="op-stack-card op-stack-c2" aria-hidden="true" />
          <div className="op-stack-card op-stack-c1">
            <span className="op-stack-icon">📸</span>
          </div>
          <span className="op-stack-hint px">CLICK TO BROWSE</span>
        </button>
      </div>
    </div>
  )
}

// ─── Photo Browser Modal (scroll through stack like real photos) ───────────────
function PhotoBrowser({ photos, onClose }) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(null) // 'left' | 'right'
  const [animKey, setAnimKey] = useState(0)

  const go = useCallback((dir) => {
    setDirection(dir)
    setAnimKey(k => k + 1)
    setIdx(i => {
      if (dir === 'right') return (i + 1) % photos.length
      return (i - 1 + photos.length) % photos.length
    })
  }, [photos.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go('right')
      if (e.key === 'ArrowLeft') go('left')
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="op-photo-browser" onClick={e => e.stopPropagation()}>
        <button className="x" onClick={onClose}>X</button>

        {/* Ticket-style header */}
        <div className="op-pb-header">
          <div className="op-pb-header-left">
            <div className="op-pb-deco-line" />
            <span className="px op-pb-title">MASQUERADE BALL</span>
            <div className="op-pb-deco-line" />
          </div>
          <div className="op-pb-ticket-stub px">
            ADMIT ONE<br />
            <span style={{ opacity: 0.6, fontSize: 6 }}>IEEE 27' OPENING</span>
          </div>
        </div>

        {/* Photo display — like flipping through a stack */}
        <div className="op-pb-stack-area">
          {/* Ghost cards behind for depth */}
          <div className="op-pb-ghost op-pb-ghost2" aria-hidden="true" />
          <div className="op-pb-ghost op-pb-ghost1" aria-hidden="true" />

          {/* Current photo */}
          <div
            key={animKey}
            className={`op-pb-photo-wrap${direction === 'right' ? ' op-pb-slide-in-right' : direction === 'left' ? ' op-pb-slide-in-left' : ''}`}
          >
            <img
              src={B + photos[idx]}
              alt={`Opening photo ${idx + 1}`}
              className="op-pb-photo"
            />
            <div className="op-pb-photo-num px">{String(idx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="op-pb-nav">
          <button className="op-pb-btn" onClick={() => go('left')}>← PREV</button>
          <div className="op-pb-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`op-pb-dot${i === idx ? ' op-pb-dot-on' : ''}`}
                onClick={() => { setDirection(i > idx ? 'right' : 'left'); setAnimKey(k => k + 1); setIdx(i) }}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <button className="op-pb-btn" onClick={() => go('right')}>NEXT →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Photo Booth Backdrop ─────────────────────────────────────────────────────
function PhotoBooth() {
  return (
    <div className="op-booth-wrap">
      <div className="op-booth-label px">📷 PHOTO BOOTH</div>
      <div className="op-booth">
        {/* Mask backdrop */}
        <div className="op-booth-backdrop">
          <div className="op-booth-curtain-left" aria-hidden="true" />
          <div className="op-booth-curtain-right" aria-hidden="true" />
          <div className="op-booth-mask" aria-hidden="true">
            <svg viewBox="0 0 80 36" width="80" height="36" aria-hidden="true">
              {/* Simplified ornate masquerade mask */}
              <ellipse cx="40" cy="20" rx="38" ry="16" fill="#1a3a8c" stroke="#c9a84c" strokeWidth="1.5" />
              <ellipse cx="22" cy="18" rx="12" ry="10" fill="#0a1a4a" stroke="#c9a84c" strokeWidth="1" />
              <ellipse cx="58" cy="18" rx="12" ry="10" fill="#0a1a4a" stroke="#c9a84c" strokeWidth="1" />
              <ellipse cx="22" cy="18" rx="8" ry="6" fill="none" stroke="#c9a84c" strokeWidth=".6" />
              <ellipse cx="58" cy="18" rx="8" ry="6" fill="none" stroke="#c9a84c" strokeWidth=".6" />
              {/* Nose bridge */}
              <path d="M32 18 Q40 24 48 18" fill="none" stroke="#c9a84c" strokeWidth="1" />
              {/* Ornate scrolls */}
              <path d="M2 20 Q8 10 14 16 Q10 20 6 24 Q4 22 2 20Z" fill="#c9a84c" opacity="0.7" />
              <path d="M78 20 Q72 10 66 16 Q70 20 74 24 Q76 22 78 20Z" fill="#c9a84c" opacity="0.7" />
              {/* Top feather hint */}
              <path d="M30 8 Q32 2 35 5 Q33 8 36 10" fill="none" stroke="#c9a84c" strokeWidth="1" />
              <path d="M50 8 Q48 2 45 5 Q47 8 44 10" fill="none" stroke="#c9a84c" strokeWidth="1" />
              {/* Center gem */}
              <circle cx="40" cy="14" r="2" fill="#c9a84c" />
            </svg>
          </div>
          {/* Balloons */}
          <div className="op-booth-balloons" aria-hidden="true">
            <span className="op-balloon op-b1">🎈</span>
            <span className="op-balloon op-b2">🎈</span>
            <span className="op-balloon op-b3">🎈</span>
          </div>
        </div>
        {/* People standing at booth (pixel silhouettes) */}
        <div className="op-booth-people">
          <BoothPerson cfg={ATTENDEE_CONFIGS[2]} />
          <BoothPerson cfg={ATTENDEE_CONFIGS[6]} />
          <BoothPerson cfg={ATTENDEE_CONFIGS[9]} />
        </div>
      </div>
    </div>
  )
}

function BoothPerson({ cfg }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="op-booth-person">
      <MasquCharSprite {...cfg} frame={frame} seated={false} />
    </div>
  )
}

// ─── Man2osha Tables (left side) ─────────────────────────────────────────────
function ManqoushaTable() {
  return (
    <div className="op-mq-wrap">
      <div className="op-mq-label px">🫓 MAN2OSHA TABLES</div>
      <div className="op-mq-table">
        <div className="op-mq-legs"><span /><span /></div>
        <div className="op-mq-items">
          <span className="op-mq-item" title="Man2osha">🫓</span>
          <span className="op-mq-item" title="Man2osha">🫓</span>
          <span className="op-mq-item" title="Man2osha">🫓</span>
          <span className="op-mq-item" title="Tea">☕</span>
          <span className="op-mq-item" title="Man2osha">🫓</span>
        </div>
      </div>
      {/* A couple characters eating */}
      <div className="op-mq-eaters">
        <div className="op-mq-eater"><MasquCharSprite {...ATTENDEE_CONFIGS[3]} frame={0} seated /></div>
        <div className="op-mq-eater"><MasquCharSprite {...ATTENDEE_CONFIGS[7]} frame={1} seated /></div>
      </div>
    </div>
  )
}

// ─── Stage (top of map) ───────────────────────────────────────────────────────
const hala = byId['hala-aboraya']
const tebry = byId['abdelrahman-tebry']

function Stage() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 350)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="op-stage">
      {/* Stage platform */}
      <div className="op-stage-platform">
        {/* Spotlight beams */}
        <div className="op-spotlight op-spot-left" aria-hidden="true" />
        <div className="op-spotlight op-spot-right" aria-hidden="true" />

        {/* Stage banner */}
        <div className="op-stage-banner">
          <div className="op-stage-banner-deco" aria-hidden="true" />
          <span className="px op-stage-title">IEEE 27' MASQUERADE BALL</span>
          <div className="op-stage-banner-deco" aria-hidden="true" />
        </div>

        {/* Hosts */}
        <div className="op-hosts">
          {/* Hala */}
          <div className="op-host">
            <div className="op-host-name-tag px">HALA</div>
            <MasquCharSprite
              archetype="hijab"
              skinColor={CHARACTER_STYLES_OPENING['hala-aboraya'].skinColor}
              hairColor={CHARACTER_STYLES_OPENING['hala-aboraya'].hairColor}
              maskColor="#c9a84c"
              shirtColor="#0d0d20"
              pantsColor="#1a1a2e"
              shoesColor="#c9a84c"
              accessoryColor="#c9a84c"
              frame={frame}
              seated={false}
            />
            {hala && (
              <div className="op-host-bubble">
                <span className="op-host-mic">🎤</span>
              </div>
            )}
          </div>

          {/* Mic stand */}
          <div className="op-mic-stand" aria-hidden="true">
            <span>🎙️</span>
          </div>

          {/* Tebry */}
          <div className="op-host" style={{ transform: 'scaleX(-1)' }}>
            <div className="op-host-name-tag px" style={{ transform: 'scaleX(-1)' }}>TEBRY</div>
            <MasquCharSprite
              archetype="curly"
              skinColor={CHARACTER_STYLES_OPENING['abdelrahman-tebry'].skinColor}
              hairColor={CHARACTER_STYLES_OPENING['abdelrahman-tebry'].hairColor}
              maskColor="#1a3a8c"
              shirtColor="#0a1020"
              pantsColor="#1a1a2e"
              shoesColor="#c9a84c"
              accessoryColor="#c9a84c"
              frame={frame}
              seated={false}
            />
            <div className="op-host-bubble">
              <span className="op-host-mic">🎤</span>
            </div>
          </div>
        </div>

        {/* Stage footlights */}
        <div className="op-footlights" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="op-footlight" style={{ animationDelay: i * 150 + 'ms' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Extended archetypes need curly for Tebry
MASKED_ARCHETYPES.curly = [
  '..HHHHHHHH..',
  '.HHHHHHHHHH.',
  '.HHMMMMMSHH.',
  '.HH.M..M.HH.',
  '.HH.SSSS.HH.',
]

const CHARACTER_STYLES_OPENING = {
  'hala-aboraya': { skinColor: '#f5c396', hairColor: '#2a1a10' },
  'abdelrahman-tebry': { skinColor: '#f5c396', hairColor: '#5a3d28' },
  'youssef-mostafa': { skinColor: '#f5c396', hairColor: '#1a110b' },
}

// ─── Celebration Scene (bottom) ──────────────────────────────────────────────
const youssef = byId['youssef-mostafa']

function CelebrationScene() {
  const [frame, setFrame] = useState(0)
  const [youssefY, setYoussefY] = useState(0)
  const rafRef = useRef(null)
  const t = useRef(0)

  useEffect(() => {
    const frameId = setInterval(() => setFrame(f => f + 1), 300)
    return () => clearInterval(frameId)
  }, [])

  useEffect(() => {
    // Youssef bouncing up and down (being thrown)
    function loop() {
      t.current += 0.06
      const y = -Math.abs(Math.sin(t.current)) * 28
      setYoussefY(y)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="op-celeb-scene">
      <div className="op-celeb-badge px">🎉 PEAK ENERGY MOMENT</div>
      <div className="op-celeb-area">

        {/* Camera person left */}
        <div className="op-camera-person op-cam-left">
          <span className="op-camera-icon">📹</span>
          <MasquCharSprite {...ATTENDEE_CONFIGS[4]} frame={frame} />
        </div>

        {/* Shoulder-rider group left */}
        <div className="op-shoulder-stack op-ss-left">
          <div className="op-rider" style={{ marginBottom: -6 }}>
            <MasquCharSprite {...ATTENDEE_CONFIGS[8]} frame={frame} seated />
          </div>
          <div className="op-carrier">
            <MasquCharSprite {...ATTENDEE_CONFIGS[5]} frame={frame} />
          </div>
        </div>

        {/* CENTER: Youssef being thrown */}
        <div className="op-thrown-group">
          <div className="op-thrown-person" style={{ transform: `translateY(${youssefY}px)` }}>
            <div className="op-thrown-crown" aria-hidden="true">👑</div>
            <MasquCharSprite
              archetype="curly"
              skinColor={CHARACTER_STYLES_OPENING['youssef-mostafa'].skinColor}
              hairColor={CHARACTER_STYLES_OPENING['youssef-mostafa'].hairColor}
              maskColor="#c9a84c"
              shirtColor="#0a0a1e"
              pantsColor="#1a1a2e"
              shoesColor="#c9a84c"
              frame={frame}
            />
            <div className="op-thrown-label px">YOUSSEF</div>
          </div>
          <div className="op-throwers">
            <MasquCharSprite {...ATTENDEE_CONFIGS[0]} frame={frame} />
            <MasquCharSprite {...ATTENDEE_CONFIGS[11]} frame={frame} />
            <MasquCharSprite {...ATTENDEE_CONFIGS[1]} frame={frame} />
          </div>
          <div className="op-thrown-hands px" aria-hidden="true">▲ ▲ ▲</div>
          <div className="op-thrown-vibe px" aria-hidden="true">🎉 🎊 🎉</div>
        </div>

        {/* Shoulder-rider group right */}
        <div className="op-shoulder-stack op-ss-right">
          <div className="op-rider" style={{ marginBottom: -6 }}>
            <MasquCharSprite {...ATTENDEE_CONFIGS[10]} frame={frame} seated />
          </div>
          <div className="op-carrier">
            <MasquCharSprite {...ATTENDEE_CONFIGS[2]} frame={frame} />
          </div>
        </div>

        {/* Camera person right */}
        <div className="op-camera-person op-cam-right">
          <MasquCharSprite {...ATTENDEE_CONFIGS[6]} frame={frame} />
          <span className="op-camera-icon">📸</span>
        </div>
      </div>
    </div>
  )
}

// ─── Floating Particles Setup ─────────────────────────────────────────────────
const PARTICLES = [
  { type: 'bat', style: { top: '8%', left: '10%', animationDelay: '0s', animationDuration: '7s' } },
  { type: 'mask', style: { top: '5%', left: '55%', animationDelay: '1.2s', animationDuration: '9s' } },
  { type: 'bat', style: { top: '12%', right: '12%', animationDelay: '2.1s', animationDuration: '8s' } },
  { type: 'sparkle', style: { top: '20%', left: '30%', animationDelay: '0.5s', animationDuration: '5s', fontSize: 18 } },
  { type: 'bat', style: { top: '3%', left: '75%', animationDelay: '3.4s', animationDuration: '10s' } },
  { type: 'star', style: { top: '15%', right: '30%', animationDelay: '1.8s', animationDuration: '6s' } },
  { type: 'mask', style: { top: '6%', left: '85%', animationDelay: '4s', animationDuration: '11s' } },
  { type: 'sparkle', style: { top: '10%', left: '45%', animationDelay: '2.7s', animationDuration: '7s', fontSize: 14 } },
  { type: 'bat', style: { top: '18%', left: '20%', animationDelay: '0.9s', animationDuration: '9s' } },
  { type: 'note', style: { top: '14%', right: '5%', animationDelay: '3.1s', animationDuration: '8s' } },
]

// ─── Main Opening Component ───────────────────────────────────────────────────
export default function Opening() {
  const [photoBrowserOpen, setPhotoBrowserOpen] = useState(false)

  return (
    <div className="op-root">

      {/* ── Title ── */}
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

      {/* ── THE MAP SCENE ── */}
      <div className="op-map" role="region" aria-label="Opening Night Map">

        {/* Floating particles (bats, masks, sparkles) */}
        {PARTICLES.map((p, i) => (
          <FloatingParticle key={i} type={p.type} style={p.style} />
        ))}

        {/* Background decorations */}
        <div className="op-map-bg" aria-hidden="true">
          {/* Gold ornamental corners */}
          <div className="op-corner op-corner-tl" />
          <div className="op-corner op-corner-tr" />
          <div className="op-corner op-corner-bl" />
          <div className="op-corner op-corner-br" />
          {/* Subtle pattern overlay */}
          <div className="op-map-pattern" />
        </div>

        {/* ── ROW 1: STAGE (top center) ── */}
        <div className="op-map-row op-row-stage">
          <Stage />
        </div>

        {/* ── ROW 2: LEFT TABLES | SEATING | RIGHT BOOTH ── */}
        <div className="op-map-row op-row-main">
          {/* Left: Man2osha tables */}
          <div className="op-map-col op-col-left">
            <ManqoushaTable />
          </div>

          {/* Center: Seating area */}
          <div className="op-map-col op-col-center">
            <div className="op-seating-wrap">
              <div className="op-seating-label px">🪑 ATTENDEE SEATING</div>
              <SeatingSection />
              {/* Floor */}
              <div className="op-map-floor" aria-hidden="true">
                {[...Array(20)].map((_, i) => (
                  <span key={i} className="op-floor-tile" style={{ '--oti': i }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Photo booth + photo table */}
          <div className="op-map-col op-col-right">
            <PhotoBooth />
            <PhotoStack onOpen={() => setPhotoBrowserOpen(true)} />
          </div>
        </div>

        {/* ── ROW 3: PATH / AISLE ── */}
        <div className="op-map-row op-row-aisle">
          <div className="op-aisle">
            <span className="op-aisle-arrow px" aria-hidden="true">▼ ▼ ▼</span>
          </div>
        </div>

        {/* ── ROW 4: CELEBRATION SCENE (bottom) ── */}
        <div className="op-map-row op-row-celeb">
          <CelebrationScene />
        </div>
      </div>

      {/* ── Photo Browser Modal ── */}
      {photoBrowserOpen && (
        <PhotoBrowser
          photos={OPENING_PHOTOS}
          onClose={() => setPhotoBrowserOpen(false)}
        />
      )}
    </div>
  )
}
