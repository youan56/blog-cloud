export default function AboutPage() {
  return (
    <div className="glass-card" style={{ padding: '3rem' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>关于我</h1>
      <div style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1.5rem' }}>你好！我是佑安，一个热爱技术、追求极致的开发者。</p>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>🎯 技术栈</h2>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li>前端：React, TypeScript, Next.js, Tailwind CSS</li>
          <li>后端：Node.js, Python, CloudBase</li>
          <li>科研：GROMACS, 分子动力学模拟，神经网络</li>
        </ul>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>💡 兴趣爱好</h2>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li>写代码、做项目、分享技术</li>
          <li>摄影、记录生活美好瞬间</li>
          <li>听音乐、特别是古风和中国风</li>
        </ul>
      </div>
    </div>
  )
}
