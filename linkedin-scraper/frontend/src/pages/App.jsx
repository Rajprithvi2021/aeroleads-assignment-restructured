import { useState } from 'react'
import axios from 'axios'

export default function App(){
  const [urls, setUrls] = useState('https://www.linkedin.com/in/xxxx\nhttps://www.linkedin.com/in/yyyy')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  async function scrape(){
    setLoading(true)
    try{
      const list = urls.split(/\s|,|\n/).map(x=>x.trim()).filter(Boolean)
      const res = await axios.post('http://localhost:8001/scrape', { urls: list })
      setData(res.data || [])
    } finally{
      setLoading(false)
    }
  }

  function downloadCSV(){
    const rows = [Object.keys(data[0]||{}), ...data.map(o=>Object.values(o))]
    const csv = rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'profiles.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-4">LinkedIn Scraper</h1>
      <div className="bg-white rounded-xl shadow p-4 max-w-3xl space-y-3">
        <textarea className="w-full border rounded p-2 h-48" value={urls} onChange={e=>setUrls(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={scrape} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>{loading?'Scraping...':'Scrape'}</button>
          {data.length>0 && <button onClick={downloadCSV} className="px-4 py-2 rounded bg-gray-800 text-white">Download CSV</button>}
        </div>
      </div>
      {data.length>0 && (
        <div className="mt-6 bg-white rounded-xl shadow p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>{Object.keys(data[0]).map(k=><th key={k} className="py-2 pr-4">{k}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row,i)=>(
                <tr key={i} className="border-t">
                  {Object.values(row).map((v,j)=>(<td key={j} className="py-2 pr-4">{String(v)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
