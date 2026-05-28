import { useState, useEffect } from 'react'

export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => setCurrentTime((prev) => (prev >= 160 ? 0 : prev + 1)))
    }
    return () => clearInterval(interval)
  }, [isPlaying])
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  return (
    <div className="glass-card" style={{ padding: '3rem' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>音乐</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>分享我喜欢的音乐 🎵</p>
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', borderRadius: '16px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🎵</div>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>云月谣</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>兰音 Reine</p>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
            <div style={{ width: `${(currentTime / 160) * 100}%`, height: '100%', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>{formatTime(currentTime)}</span><span>02:40</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <button onClick={() => setCurrentTime(0)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="btn-primary" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{isPlaying ? '⏸' : '▶'}</button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>⏭</button>
        </div>
      </div>
    </div>
  )
}
