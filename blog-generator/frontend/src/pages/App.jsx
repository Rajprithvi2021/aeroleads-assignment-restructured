import { useState } from 'react'
import axios from 'axios'

export default function App(){
  const [titles, setTitles] = useState('10 Tips for Clean Python Code\nUnderstanding React Router')
  const [articles, setArticles] = useState([])

  async function generate(){
    const list = titles.split(/\n/).map(x=>x.trim()).filter(Boolean)
    const res = await axios.post('http://localhost:8003/generate', { titles: list })
    setArticles(res.data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-4">Blog Generator</h1>
      <div className="bg-white rounded-xl shadow p-4 max-w-3xl space-y-3">
        <textarea className="w-full border rounded p-2 h-48" value={titles} onChange={e=>setTitles(e.target.value)} />
        <button onClick={generate} className="px-4 py-2 rounded bg-blue-600 text-white">Generate</button>
      </div>
      <div className="mt-6 space-y-4">
        {articles.map((a,i)=>(
          <article key={i} className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold">{a.title}</h2>
            <div className="prose prose-sm" dangerouslySetInnerHTML={{__html: a.body.replaceAll('\n','<br/>')}}/>
          </article>
        ))}
      </div>
    </div>
  )
}
