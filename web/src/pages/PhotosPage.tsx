export default function PhotosPage() {
  const photos = [
    { title: '南昌五一摄影', date: '2026.05.01' },
    { title: '春日随拍', date: '2026.04.15' },
    { title: '夜景', date: '2026.03.20' },
    { title: '校园风景', date: '2026.02.10' },
  ]
  return (
    <div className="glass-card" style={{ padding: '3rem' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>照片墙</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>记录生活中的美好瞬间 📸</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {photos.map((photo, i) => (
          <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📷</div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{photo.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{photo.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
