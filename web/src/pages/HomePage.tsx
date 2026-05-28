export default function HomePage() {
  return (
    <div className="glass-card" style={{ padding: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white'
        }}>
          佑
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>佑安 Mi</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>
          在代码、学术与分子动力学模拟间穿梭的普通人。
          近期正埋头于 GROMACS 模拟研究与神经网络计算。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
          <div><div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>77</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>文章</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>16</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>杂谈</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>11</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>照片</div></div>
        </div>
      </div>
      <div>
        <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>LATEST INSIGHT</h2>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '200px', height: '120px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', borderRadius: '12px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>第 {i} 篇博客文章标题</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>2026.05.{10 + i} 15:00</p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>这是博客文章的简短描述，介绍文章的主要内容和亮点...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
