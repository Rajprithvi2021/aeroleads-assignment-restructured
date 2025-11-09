# api.py
from fastapi import FastAPI
from scraper_selenium import scrape_profiles

app = FastAPI()

@app.get("/scrape")
def scrape_linkedin_profiles():
    df = scrape_profiles()
    result = df.to_dict(orient="records")
    return {"status": "success", "count": len(result), "data": result}
