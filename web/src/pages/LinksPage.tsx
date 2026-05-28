export default function LinksPage() {
  const links = [
    { name: '朋友 A 的博客', url: 'https://example.com', desc: '技术分享' },
    { name: '朋友 B 的网站', url: 'https://example.com', desc: '设计作品' },
    { name: '朋友 C 的主页', url: 'https://example.com', desc: '摄影作品' },
  ]
  return (
    <div className="glass-card" style={{ padding: '3rem' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>友情链接</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>这些都是我的好朋友，欢迎访问他们的网站！</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {links.map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="glass-card" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{link.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
