'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

type ScreenType = 
  | 'gift_intro' | 'cake_lit' | 'cake_blown' 
  | 'envelope' | 'letter' | 'moments' | 'song' | 'date' | 'success'

export default function GiftClient({ data }: Props) {
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<ScreenType>('gift_intro')
  
  // Global Music
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Our Song Player
  const [isSongPlaying, setIsSongPlaying] = useState(false)
  const [songProgress, setSongProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const songAudioRef = useRef<HTMLAudioElement | null>(null)

  const [noCount, setNoCount] = useState(0)

  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const confettiAnimRef = useRef<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (data.musicUrl) {
      const audio = new Audio(data.musicUrl)
      audio.loop = true; audio.volume = 0.3
      audioRef.current = audio
    }
    return () => audioRef.current?.pause()
  }, [data.musicUrl])

  const navigateTo = useCallback((newScreen: ScreenType) => {
    window.history.pushState({ screen: newScreen }, '')
    setScreen(newScreen)
    
    if (newScreen !== 'song' && isSongPlaying && songAudioRef.current) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    }
  }, [isSongPlaying])

  useEffect(() => {
    window.history.replaceState({ screen: 'gift_intro' }, '')
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) setScreen(event.state.screen)
      else setScreen('gift_intro')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // --- Functions for "Our Song" Player ---
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const toggleOurSong = () => {
    if (!songAudioRef.current) return
    if (isSongPlaying) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    } else {
      if (musicPlaying && audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
      songAudioRef.current.play()
      setIsSongPlaying(true)
    }
  }

  const handleSongTimeUpdate = () => {
    if (songAudioRef.current) {
      setCurrentTime(songAudioRef.current.currentTime)
      if (songAudioRef.current.duration) {
        setSongProgress((songAudioRef.current.currentTime / songAudioRef.current.duration) * 100)
      }
    }
  }

  const handleSongLoadedMetadata = () => {
    if (songAudioRef.current) {
      setDuration(songAudioRef.current.duration)
    }
  }

  const handleSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (songAudioRef.current && songAudioRef.current.duration) {
      const newTime = (Number(e.target.value) / 100) * songAudioRef.current.duration
      songAudioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setSongProgress(Number(e.target.value))
    }
  }

  const skipForward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.min(songAudioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.max(songAudioRef.current.currentTime - 10, 0)
    }
  }

  // Confetti function...
  const launchConfetti = useCallback(() => {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight

    const pieces: any[] = []
    const colors = ['#38bdf8', '#0284c7', '#818cf8', '#c084fc', '#fff', '#ffd700']
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed; p.vy += 0.05 
        if (p.y < canvas.height + 20) alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore()
      }
      if (alive) confettiAnimRef.current = requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current)
    confettiAnimRef.current = requestAnimationFrame(animate)
  }, [])

  return (
    <div className="gift-page">
      <div className="corners-overlay">
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
      </div>
      <div className="side-text left">BIRTHDAY • CELEBRATION</div>
      <div className="side-text right">WITH LOVE • FOR YOU</div>

      <canvas ref={confettiRef} id="confetti-canvas" style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }} />

      {/* ── SCREEN 1: INTRO ── */}
      <div className={`screen ${screen === 'gift_intro' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <p className="subtitle">✦ Something special is waiting ✦</p>
          <h1 className="gift-title">A Gift <br/><span>just for You</span></h1>
          <div className="crown-icon">👑</div>
          <div className="dots">• • •</div>
          <p className="description">
            "Today is a day as beautiful as you are. I've prepared a little digital surprise to celebrate your special moment."
          </p>
          <button className="btn-primary" onClick={() => navigateTo('cake_lit')}>Open Your Surprise 🎁</button>
        </div>
      </div>

      {/* ── SCREEN 2: CAKE LIT ── */}
      <div className={`screen ${screen === 'cake_lit' ? 'visible' : ''}`}>
        <BuntingSVG />
        <div className="content-wrapper">
          <div className="svg-container">
            <div className="cake-glow"></div>
            <CakeLitSVG />
          </div>
          <h2 className="gift-title">Make a wish, <span>{data.name}</span> 👑</h2>
          <button className="btn-primary" onClick={() => { navigateTo('cake_blown'); setTimeout(launchConfetti, 100) }}>
            Blow the Candle 🎈
          </button>
        </div>
      </div>

      {/* ── SCREEN 3: CAKE BLOWN ── */}
      <div className={`screen ${screen === 'cake_blown' ? 'visible' : ''}`}>
        <BuntingSVG />
        <div className="content-wrapper">
          <div className="svg-container" style={{ opacity: 0.8 }}>
            <CakeBlownSVG />
          </div>
          <h2 className="gift-title" style={{ marginBottom: '1.5rem' }}>Happy Birthday, King! 🎂</h2>
          <button className="btn-secondary" onClick={() => navigateTo('cake_lit')}>Light it Again ✨</button>
          
          <p className="subtitle" style={{ marginTop: '1rem', color: '#38bdf8' }}>You have a secret letter</p>
          <button className="secret-link" onClick={() => navigateTo('envelope')}>Click to read ✉️</button>
        </div>
      </div>

      {/* ── SCREEN 4: ENVELOPE ── */}
      <div className={`screen ${screen === 'envelope' ? 'visible' : ''}`}>
        <div className="content-wrapper" onClick={() => navigateTo('letter')}>
          <div className="svg-container envelope">
            <EnvelopeSVG />
          </div>
          <p className="subtitle" style={{ letterSpacing: '0.2em', cursor: 'pointer' }}>✦ Click to open your letter ✦</p>
        </div>
      </div>

      {/* ── SCREEN 5: LETTER ── */}
      <div className={`screen ${screen === 'letter' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="letter-card">
            <div className="top-accent-sq"></div>
            <h2 className="letter-title">To my favorite person,</h2>
            
            <div className="letter-scroll-area">
              <div className="letter-body">{data.message}</div>
              <div className="letter-divider"><span>✦</span></div>
              <div className="signature">
                <p>With all my love,</p>
                <p>{data.senderName || 'Youssef'} ✨</p>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigateTo('moments')}>See the next surprise →</button>
          </div>
        </div>
      </div>

      {/* ── SCREEN 6: MOMENTS ── */}
      <div className={`screen ${screen === 'moments' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <h2 className="gift-title" style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>Captured Moments</h2>
          <p className="subtitle" style={{ color: '#64748b', textTransform: 'lowercase' }}>tap a memory to reveal</p>
          
          <div className="moments-grid">
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image src="/images/pic1.jpg" alt="Memory 1" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image src="/images/pic2.jpg" alt="Memory 2" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image src="/images/pic3.jpg" alt="Memory 3" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
            <div className="polaroid-card">
               <div className="polaroid-pin"></div>
               <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image src="/images/pic4.jpg" alt="Memory 4" fill style={{ objectFit: 'cover' }} unoptimized />
               </div>
            </div>
          </div>

          <p className="description" style={{ color: '#38bdf8', marginBottom: '1.5rem' }}>"One of the best memories we've ever shared..."</p>
          <button className="btn-primary" onClick={() => navigateTo('song')}>Hear our song 🎵</button>
        </div>
      </div>

      {/* ── NEW SCREEN: OUR SONG (Apple Music Style) ── */}
      <div className={`screen ${screen === 'song' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          
          <div className="player-container">
            {/* الأسطوانة التي تدور بالخلف */}
            <div className={`vinyl-record-container ${isSongPlaying ? 'vinyl-spin' : 'vinyl-paused'}`}>
              <VinylSVG />
            </div>

            {/* كارت المشغل الرئيسي */}
            <div className="music-player-card">
              
              {/* صورة الكوفر (يمكنك وضع صورة خاصة بكم هنا) */}
              <div className="player-cover">
                {/* ضع مسار صورتكم هنا بدلاً من اللون السادة (اختياري) */}
                <Image src="/images/pic5.jpg" alt="Our Song Cover" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>

              {/* المعلومات */}
              <div className="player-info">
                <div className="player-title">Our Song</div>
                <div className="player-artist">every word for you</div>
              </div>

              {/* شريط الوقت */}
              <div className="timeline-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={songProgress || 0} 
                  onChange={handleSongSeek} 
                  className="ios-slider"
                />
                <div className="time-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="player-controls">
                <button className="control-btn" onClick={skipBackward}>
                  <BackwardIcon />
                </button>
                <button className="control-btn play-pause-circle" onClick={toggleOurSong}>
                  {isSongPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className="control-btn" onClick={skipForward}>
                  <ForwardIcon />
                </button>
              </div>

              {/* شريط الصوت (شكلي فقط للتصميم) */}
              <div className="volume-container">
                <VolumeMinIcon />
                <input type="range" className="ios-slider" style={{ marginBottom: 0 }} defaultValue="80" />
                <VolumeMaxIcon />
              </div>

            </div>
          </div>

          <audio 
            ref={songAudioRef} 
            src="/audio/song.mp3" 
            onTimeUpdate={handleSongTimeUpdate}
            onLoadedMetadata={handleSongLoadedMetadata}
            onEnded={() => setIsSongPlaying(false)}
          />

          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigateTo('date')}>
            See your last surprise →
          </button>
        </div>
      </div>

      {/* ── SCREEN 7: DATE ── */}
      <div className={`screen ${screen === 'date' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <p className="subtitle">✦ IMPORTANT QUESTION ✦</p>
          <h1 className="gift-title">Will you stay with me forever?</h1>
          
          <div className="svg-container">
            <Image src="/images/bear-ask.jpg" alt="Will you stay with me?" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" style={{ fontSize: `${1 + noCount * 0.1}rem`, padding: `${0.8 + noCount * 0.1}rem ${2 + noCount * 0.1}rem` }} onClick={() => { navigateTo('success'); setTimeout(launchConfetti, 300) }}>Yes!</button>
            <button className="secret-link" style={{ padding: '0.8rem 1.5rem', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', margin: 0 }} onClick={() => setNoCount(noCount + 1)}>
              {['No', 'Please? 🥺', 'Really?!', 'Are you sure?', 'Knew you would say yes!'][Math.min(noCount, 4)]}
            </button>
          </div>
        </div>
      </div>

      {/* ── SCREEN 8: SUCCESS ── */}
      <div className={`screen ${screen === 'success' ? 'visible' : ''}`}>
        <Sparkles />
        <div className="content-wrapper">
          <p className="subtitle">✦ IT IS A YES! ✦</p>
          <h1 className="gift-title">Knew you would say yes! 💙</h1>
          <div className="svg-container">
            <Image src="/images/bear-hug.gif" alt="Yay!" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS & PURE SVGS
// =============================================

function Sparkles() { /* ... */ return (<div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}>{Array.from({ length: 15 }).map((_, i) => (<span key={i} style={{ position: 'absolute', width: '3px', height: '3px', background: '#fff', borderRadius: '50%', top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 13) % 90}%`, boxShadow: '0 0 10px #38bdf8', opacity: 0.5 }}/>))}</div>) }
function BuntingSVG() { /* ... */ return (<svg width="100%" height="80" viewBox="0 0 800 80" preserveAspectRatio="none" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.7, pointerEvents: 'none' }}><line x1="0" y1="20" x2="800" y2="20" stroke="#1e3a8a" strokeWidth="2" />{[...Array(10)].map((_, i) => (<polygon key={i} points={`${30 + i * 80},20 ${60 + i * 80},20 ${45 + i * 80},60`} fill={i % 2 === 0 ? "#2563eb" : "#38bdf8"} />))}</svg>) }
function CakeLitSVG() { /* ... */ return (<svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}><ellipse cx="100" cy="180" rx="75" ry="10" fill="#0f172a"/><path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#1e3a8a"/><rect x="55" y="90" width="90" height="40" rx="4" fill="#2563eb"/><rect x="70" y="55" width="60" height="35" rx="4" fill="#3b82f6"/><circle cx="50" cy="130" r="5" fill="#38bdf8"/><circle cx="80" cy="130" r="5" fill="#38bdf8"/><circle cx="110" cy="130" r="5" fill="#38bdf8"/><circle cx="140" cy="130" r="5" fill="#38bdf8"/><rect x="96" y="25" width="8" height="30" rx="1" fill="#38bdf8"/><line x1="96" y1="35" x2="104" y2="30" stroke="#0284c7" strokeWidth="2"/><g style={{ animation: 'pulse 1s infinite alternate', transformOrigin: '100px 22px' }}><path d="M100 8 C92 18 92 26 100 30 C108 26 108 18 100 8 Z" fill="#facc15"/></g></svg>) }
function CakeBlownSVG() { /* ... */ return (<svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}><ellipse cx="100" cy="180" rx="75" ry="10" fill="#0f172a"/><path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#1e3a8a"/><rect x="55" y="90" width="90" height="40" rx="4" fill="#2563eb"/><rect x="70" y="55" width="60" height="35" rx="4" fill="#3b82f6"/><rect x="96" y="25" width="8" height="30" rx="1" fill="#38bdf8"/><path d="M100 20 Q 95 10 100 0 T 100 -10" stroke="#64748b" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>) }
function EnvelopeSVG() { /* ... */ return (<svg viewBox="0 0 240 160" fill="none" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.6))' }}><rect width="240" height="160" rx="8" fill="#0f172a"/><rect x="15" y="10" width="210" height="80" rx="4" fill="#334155"/><path d="M0 160 L120 70 L240 160 Z" fill="#161b22"/><path d="M0 0 L120 70 L0 160 Z" fill="#12161f"/><path d="M240 0 L120 70 L240 160 Z" fill="#12161f"/><path d="M0 0 L120 95 L240 0 Z" fill="#1e293b"/><circle cx="120" cy="95" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="1"/><path d="M120 99.5 C112 91.5 108 95.5 108 99.5 C108 107.5 120 115.5 120 115.5 C120 115.5 132 107.5 132 99.5 C132 95.5 128 91.5 120 99.5 Z" fill="#38bdf8"/></svg>) }

/* --- ICONS FOR PLAYER --- */
function VinylSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <circle cx="100" cy="100" r="100" fill="#020617" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="100" r="64" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="100" r="35" fill="#1e293b" />
      <circle cx="100" cy="100" r="30" fill="#38bdf8" />
      <circle cx="100" cy="100" r="5" fill="#020617" />
    </svg>
  )
}

function PlayIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> }
function PauseIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> }
function ForwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg> }
function BackwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg> }
function VolumeMinIcon() { return <svg viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg> }
function VolumeMaxIcon() { return <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg> }