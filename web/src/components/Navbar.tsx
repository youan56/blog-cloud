import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo gradient-text">
          佑安 Mi
        </Link>
        <ul className="navbar-links">
          <li><Link to="/">首页</Link></li>
          <li><Link to="/about">关于</Link></li>
          <li><Link to="/photos">照片墙</Link></li>
          <li><Link to="/music">音乐</Link></li>
          <li><Link to="/links">友链</Link></li>
          <li><Link to="/login" className="btn-primary" style={{ padding: '8px 16px' }}>登录</Link></li>
        </ul>
      </div>
    </nav>
  )
}
