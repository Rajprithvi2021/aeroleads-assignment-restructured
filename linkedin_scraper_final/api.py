from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
from scraper_playwright import run_scraper

app = FastAPI(title="LinkedIn Scraper API (Playwright)")

class ScrapeRequest(BaseModel):
    urls: list[str] = []

@app.post("/scrape")
async def scrape_profiles(req: ScrapeRequest):
    urls = req.urls or []
    if not urls:
        return {"error": "No URLs provided."}
    try:
        results = await run_scraper(urls)
        return {"count": len(results), "data": results}
    except Exception as e:
        return {"error": str(e)}
