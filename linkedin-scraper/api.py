from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from scraper import main as scrape_profiles
import traceback

app = FastAPI(
    title="LinkedIn Scraper API",
    description="Scrapes LinkedIn profiles using Selenium and returns structured data.",
    version="1.0.0"
)

class Payload(BaseModel):
    urls: List[str]

@app.post("/scrape")
def scrape(payload: Payload):
    """
    Accepts a list of LinkedIn URLs and scrapes profile details.
    Returns structured JSON data.
    """
    try:
        if not payload.urls:
            raise HTTPException(status_code=400, detail="No URLs provided")

        print(f"Starting scrape for {len(payload.urls)} URLs...")
        results = scrape_profiles(payload.urls)

        if not results:
            raise HTTPException(status_code=500, detail="No profiles scraped. Check credentials or proxies.")

        return {"count": len(results), "profiles": results}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Scraper failed: {str(e)}")

@app.get("/")
def home():
    return {"status": "ok", "message": "LinkedIn Scraper API running"}
