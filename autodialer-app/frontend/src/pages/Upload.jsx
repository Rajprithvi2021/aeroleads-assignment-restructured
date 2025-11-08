import { useState } from 'react'
import axios from 'axios'

export default function Upload(){
  const [numbers, setNumbers] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setSubmitting(true)
    try{
      const list = numbers.split(/\s|,|\n/).map(x=>x.trim()).filter(Boolean)
      await axios.post('/api/dialer/upload', { numbers: list })
      alert('Uploaded numbers ('+list.length+')')
    } finally{
      setSubmitting(false)
    }
  }

  async function startCalls(){
    setSubmitting(true)
    try{
      await axios.post('/api/dialer/start')
      alert('Started dialer')
    } finally{
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Upload Numbers</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-4 space-y-3">
        <textarea className="w-full border rounded p-2 h-48" placeholder="Paste up to 100 phone numbers"
          value={numbers} onChange={e=>setNumbers(e.target.value)} />
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={submitting}>Upload</button>
          <button type="button" onClick={startCalls} className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50" disabled={submitting}>Start Calling</button>
        </div>
      </form>
    </div>
  )
}
