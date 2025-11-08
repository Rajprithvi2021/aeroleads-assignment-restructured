import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard(){
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const res = await axios.get('/api/dialer/logs')
        setLogs(res.data || [])
      } finally{
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Call Logs</h1>
      {loading ? <div>Loading...</div> : (
        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr><th className="py-2">Number</th><th>Status</th><th>Duration</th><th>Started</th></tr>
            </thead>
            <tbody>
              {logs.map((r,i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2">{r.number}</td>
                  <td>{r.status}</td>
                  <td>{r.duration || '-'}</td>
                  <td>{r.startedAt || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
