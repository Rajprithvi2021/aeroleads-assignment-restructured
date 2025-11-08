import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Blog(){
  const [title, setTitle] = useState('Understanding Promises in JavaScript')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  async function load(){
    const res = await axios.get('/api/blog')
    setPosts(res.data || [])
  }
  useEffect(()=>{ load() }, [])

  async function generate(){
    setLoading(true)
    try{
      const res = await axios.post('/api/blog/generate', { titles: [title] })
      await load()
      alert('Generated')
    } finally{
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Blog</h1>
      <div className="bg-white p-4 rounded-xl shadow max-w-2xl space-y-3">
        <input className="w-full border rounded p-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title"/>
        <button onClick={generate} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>{loading?'Generating...':'Generate'}</button>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {posts.map((p,i)=>(
          <div key={i} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600">{p.createdAt}</div>
            <p className="mt-2 line-clamp-4">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
