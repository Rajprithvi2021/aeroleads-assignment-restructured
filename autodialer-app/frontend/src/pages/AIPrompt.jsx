import { useState } from 'react'
import axios from 'axios'

export default function AIPrompt(){
  const [prompt, setPrompt] = useState('make a call to 1800123456 and say hello')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function run(){
    setLoading(true)
    try{
      const res = await axios.post('/api/ai/prompt', { prompt })
      setResult(res.data)
    } finally{
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">AI Prompt</h1>
      <div className="bg-white shadow rounded-xl p-4 space-y-3">
        <input className="w-full border rounded p-2" value={prompt} onChange={e=>setPrompt(e.target.value)} />
        <button onClick={run} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>{loading?'Running...':'Submit'}</button>
        {result && <pre className="bg-gray-50 p-3 rounded overflow-auto text-xs">{JSON.stringify(result,null,2)}</pre>}
      </div>
    </div>
  )
}
