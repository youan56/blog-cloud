import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LinksPage from './pages/LinksPage'
import PhotosPage from './pages/PhotosPage'
import MusicPage from './pages/MusicPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
