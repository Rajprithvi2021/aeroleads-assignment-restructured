import time
import csv
import random
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from config import PROFILE_URLS

class LinkedInScraper:
    def __init__(self):
        self.profiles = []
        self.ua = UserAgent()

    def scrape_profile(self, url, retries=2):
        for attempt in range(1, retries + 1):
            try:
                headers = {"User-Agent": self.ua.random}
                print(f"Scraping ({attempt}) → {url}")
                response = requests.get(url, headers=headers, timeout=10)

                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}")

                soup = BeautifulSoup(response.text, "html.parser")
                name = soup.find("title").text.strip() if soup.find("title") else "No title"
                headline = soup.find("meta", {"property": "og:description"})
                headline = headline["content"] if headline else "No headline"

                self.profiles.append({
                    "url": url,
                    "name": name,
                    "headline": headline,
                    "location": "N/A",
                    "about": "N/A",
                    "company": "N/A"
                })
                print(f"✅ Scraped {name}")
                return
            except Exception as e:
                print(f"⚠️ Attempt {attempt} failed for {url}: {str(e)}")
                if attempt == retries:
                    self.profiles.append({"url": url, "name": "Error", "error": str(e)})

    def scrape_all(self, urls=None):
        urls_to_scrape = urls or PROFILE_URLS
        if not urls_to_scrape:
            print("⚠️ No URLs provided to scrape.")
            return []
        print(f"Scraping {len(urls_to_scrape)} profiles...")
        for i, url in enumerate(urls_to_scrape, 1):
            print(f"[{i}/{len(urls_to_scrape)}] {url}")
            self.scrape_profile(url)
            time.sleep(random.uniform(1.0, 2.5))
        print("✅ Completed scraping!")
        return self.profiles

    def save_to_csv(self, filename="profiles.csv"):
        if not self.profiles:
            return
        print(f"Saving to {filename}...")
        fieldnames = ['url', 'name', 'headline', 'location', 'about', 'company']
        with open(filename, "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(self.profiles)
        print(f"Saved {len(self.profiles)} profiles.")

def main(urls=None):
    scraper = LinkedInScraper()
    profiles = scraper.scrape_all(urls)
    scraper.save_to_csv()
    return profiles

if __name__ == "__main__":
    main()
