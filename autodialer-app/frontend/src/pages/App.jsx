import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Upload from './Upload.jsx'
import AIPrompt from './AIPrompt.jsx'
import Blog from './Blog.jsx'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6">
          <div className="font-semibold">Autodialer</div>
          <NavLink to="/" className={({isActive})=> isActive?'text-blue-600':'text-gray-700'}>Dashboard</NavLink>
          <NavLink to="/upload" className={({isActive})=> isActive?'text-blue-600':'text-gray-700'}>Upload Numbers</NavLink>
          <NavLink to="/ai" className={({isActive})=> isActive?'text-blue-600':'text-gray-700'}>AI Prompt</NavLink>
          <NavLink to="/blog" className={({isActive})=> isActive?'text-blue-600':'text-gray-700'}>Blog</NavLink>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route index element={<Dashboard/>} />
          <Route path="/upload" element={<Upload/>} />
          <Route path="/ai" element={<AIPrompt/>} />
          <Route path="/blog" element={<Blog/>} />
        </Routes>
      </main>
    </div>
  )
}
