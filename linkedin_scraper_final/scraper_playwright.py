import asyncio
import pandas as pd
import random
from fake_useragent import UserAgent
from playwright.async_api import async_playwright
from config import LINKEDIN_EMAIL, LINKEDIN_PASSWORD, PROFILE_URLS


class LinkedInScraper:
    def __init__(self):
        self.profiles = []
        self.ua = UserAgent()

    async def login_and_scrape(self, urls):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
            context = await browser.new_context(
                user_agent=self.ua.random,
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()

            print("🔐 Logging into LinkedIn...")
            await page.goto("https://www.linkedin.com/login", timeout=60000)
            await page.fill("input#username", LINKEDIN_EMAIL)
            await page.fill("input#password", LINKEDIN_PASSWORD)
            await page.click("button[type='submit']")
            await page.wait_for_load_state("networkidle")
            print("✅ Logged in successfully!")

            for i, url in enumerate(urls, 1):
                try:
                    print(f"[{i}/{len(urls)}] Scraping {url}")
                    await page.goto(url, wait_until="domcontentloaded", timeout=120000)

                    # Wait for the main heading
                    await page.wait_for_selector("h1", timeout=20000)

                    name = (await page.locator("h1").text_content()) or "N/A"
                    headline = (
                        await page.locator(".text-body-medium, .pv-text-details__left-panel").first.text_content()
                    ) or "N/A"

                    # Broader fallback for About section
                    about_locator = page.locator(
                        "section.artdeco-card p, div.display-flex.ph5.pv3 span, div[data-section='summary'] p"
                    )

                    about = "N/A"
                    try:
                        about = (await about_locator.first.text_content(timeout=5000)) or "N/A"
                    except Exception:
                        pass  # no about section found

                    self.profiles.append({
                        "url": url,
                        "name": name.strip(),
                        "headline": headline.strip(),
                        # "about": about.strip(),
                    })

                    print(f"✅ Scraped {name.strip()}")
                    await asyncio.sleep(random.uniform(2, 4))

                except Exception as e:
                    print(f"⚠️ Error scraping {url}: {e}")
                    self.profiles.append({"url": url, "error": str(e)})
                    continue

            await browser.close()
            return self.profiles

    def save_to_csv(self, filename="profiles.csv"):
        if not self.profiles:
            print("⚠️ No profiles scraped.")
            return
        df = pd.DataFrame(self.profiles)
        df.to_csv(filename, index=False)
        print(f"✅ Saved {len(self.profiles)} profiles to {filename}.")


async def run_scraper(urls):
    scraper = LinkedInScraper()
    data = await scraper.login_and_scrape(urls)
    scraper.save_to_csv()
    return data


if __name__ == "__main__":
    asyncio.run(run_scraper(PROFILE_URLS))
