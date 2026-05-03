'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

export default function GiftClient({ data }: Props) {
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<'intro' | 'birthday'>('intro')
  const [introExiting, setIntroExiting] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const confettiAnimRef = useRef<number | null>(null)

  // Apply custom accent color from data
  useEffect(() => {
    if (data.accentColor) {
      document.documentElement.style.setProperty('--accent', data.accentColor)
    }
  }, [data.accentColor])

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  // Audio setup
  useEffect(() => {
    if (data.musicUrl) {
      const audio = new Audio(data.musicUrl)
      audio.loop = true
      audio.volume = 0.4
      audioRef.current = audio
    }
    return () => {
      audioRef.current?.pause()
    }
  }, [data.musicUrl])

  // Confetti launcher
  const launchConfetti = useCallback(() => {
    const canvas = confettiRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces: ConfettiPiece[] = []
    const colors = ['#e8a87c', '#f9c784', '#ff7eb3', '#7eb8f7', '#b8f77e', '#f77eb8', '#fff', '#ffd700']

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        opacity: 1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let alive = false
      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.vy += 0.05 // gravity
        if (p.y < canvas.height + 20) alive = true

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (alive) {
        confettiAnimRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current)
    confettiAnimRef.current = requestAnimationFrame(animate)
  }, [])

  // Handle transition to birthday screen
  const handleEnvelopeClick = useCallback(() => {
    if (screen !== 'intro') return
    setIntroExiting(true)
    setTimeout(() => {
      setScreen('birthday')
      setIntroExiting(false)
      // Launch confetti after screen transition
      setTimeout(launchConfetti, 400)
      setTimeout(launchConfetti, 1200)
    }, 600)
  }, [screen, launchConfetti])

  // Music toggle
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }, [musicPlaying])

  return (
    <div className="gift-page">
      {/* Loading Screen */}
      <div className={`loading-screen ${loading ? '' : 'hidden'}`}>
        <div className="loading-heart">💌</div>
        <div className="loading-text">
          preparing your gift<span className="loading-dots" />
        </div>
      </div>

      {/* Confetti Canvas */}
      <canvas ref={confettiRef} id="confetti-canvas" />

      {/* ── SCREEN 1: INTRO ── */}
      <div
        className={`screen intro-screen ${
          screen === 'intro' && !loading
            ? introExiting ? 'exit' : 'visible'
            : 'hidden'
        }`}
        onClick={handleEnvelopeClick}
        aria-label="Click to open your birthday gift"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleEnvelopeClick()}
      >
        {/* Floating hearts */}
        <FloatingHearts />

        <div className="intro-content">
          <p className="intro-text-top">hello {data.name.toLowerCase()}!</p>

          <div className="envelope-wrapper">
            <Image
              src={data.envelopeImage}
              alt="Birthday envelope"
              width={340}
              height={260}
              className="envelope-image"
              priority
            />
          </div>

          <p className="intro-text-bottom">got a mail for you &lt;3</p>
          <p className="click-hint">tap to open ✨</p>
        </div>
      </div>

      {/* ── SCREEN 2: BIRTHDAY ── */}
      <div
        className={`screen birthday-screen ${
          screen === 'birthday' ? 'visible' : 'hidden'
        }`}
      >
        {/* Sparkles */}
        <Sparkles />

        <div className="birthday-inner">
          <div className="birthday-image-wrapper">
            <Image
              src={data.birthdayImage}
              alt={`Happy Birthday ${data.name}`}
              width={700}
              height={1000}
              className="birthday-image"
              priority
            />
          </div>
        </div>

        {/* Music button — only show if music URL is set */}
        {data.musicUrl && (
          <button
            className={`music-btn ${musicPlaying ? 'playing' : ''}`}
            onClick={toggleMusic}
            aria-label={musicPlaying ? 'Pause music' : 'Play music'}
            title={musicPlaying ? 'Pause music' : 'Play music'}
          >
            {musicPlaying ? '🎵' : '🔇'}
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================
// FLOATING HEARTS COMPONENT
// =============================================
function FloatingHearts() {
  const hearts = ['❤️', '🧡', '💛', '💗', '💝', '💖', '✨', '🌸']
  return (
    <div className="floating-hearts" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="heart-particle"
          style={{
            left: `${5 + (i * 8.5) % 90}%`,
            bottom: '-20px',
            animationDuration: `${6 + (i * 1.3) % 8}s`,
            animationDelay: `${(i * 0.7) % 5}s`,
            fontSize: `${0.8 + (i * 0.2) % 1.2}rem`,
          }}
        >
          {hearts[i % hearts.length]}
        </span>
      ))}
    </div>
  )
}

// =============================================
// SPARKLES COMPONENT
// =============================================
function Sparkles() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            top: `${10 + (i * 12) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            animationDuration: `${2 + (i * 0.4) % 3}s`,
            animationDelay: `${(i * 0.5) % 2}s`,
          }}
        />
      ))}
    </div>
  )
}

// =============================================
// TYPES
// =============================================
interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  shape: 'rect' | 'circle'
  opacity: number
}
