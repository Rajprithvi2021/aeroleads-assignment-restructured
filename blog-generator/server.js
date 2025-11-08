import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors({origin:true, credentials:true}))
app.use(express.json())

// POST /generate { titles: string[] }
app.post('/generate', async (req, res) => {
  const { titles=[] } = req.body || {}
  // TODO: call Gemini/Perplexity/OpenAI here; returning mock bodies for now
  const out = titles.map(t => ({
    title: t,
    body: `# ${t}\n\nThis is an AI-generated draft. Replace with real LLM content.`,
    createdAt: new Date().toISOString()
  }))
  res.json(out)
})

app.get('/', (req,res)=>res.json({ok:true, service:'blog-generator'}))

const port = process.env.PORT || 8003
app.listen(port, ()=> console.log('blog-generator on', port))
