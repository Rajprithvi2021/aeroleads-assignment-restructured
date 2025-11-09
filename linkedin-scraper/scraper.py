import time
import csv
import random
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.browser_setup import setup_browser
from utils.data_parser import parse_profile
from config import LINKEDIN_EMAIL, LINKEDIN_PASSWORD, PROFILE_URLS, USE_PROXY


class LinkedInScraper:
    def __init__(self):
        self.driver = setup_browser(USE_PROXY)
        self.wait = WebDriverWait(self.driver, 10)
        self.profiles = []

    def login(self):
        print("Logging into LinkedIn...")
        try:
            self.driver.get("https://www.linkedin.com/login")
            time.sleep(2)
            email_field = self.wait.until(EC.presence_of_element_located((By.ID, "username")))
            email_field.send_keys(LINKEDIN_EMAIL)
            password_field = self.driver.find_element(By.ID, "password")
            password_field.send_keys(LINKEDIN_PASSWORD)
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            time.sleep(5)
            print("Login successful!")
            return True
        except Exception as e:
            print(f"Login failed: {str(e)}")
            return False

    def scrape_profile(self, url, retries=2):
        for attempt in range(1, retries + 1):
            try:
                print(f"Scraping ({attempt}) → {url}")
                self.driver.get(url)
                time.sleep(random.uniform(3, 6))
                profile_data = parse_profile(self.driver)
                profile_data['url'] = url
                self.profiles.append(profile_data)
                print(f"✅ Scraped {profile_data.get('name', 'Unknown')}")
                return
            except Exception as e:
                print(f"⚠️ Attempt {attempt} failed for {url}: {str(e)}")
                if attempt == retries:
                    self.profiles.append({'url': url, 'name': 'Error', 'error': str(e)})

    def scrape_all(self, urls=None):
        """Scrape either provided URLs or those from config.PROFILE_URLS"""
        if not self.login():
            return []
        urls_to_scrape = urls or PROFILE_URLS
        print(f"Scraping {len(urls_to_scrape)} profiles...")
        for i, url in enumerate(urls_to_scrape, 1):
            print(f"[{i}/{len(urls_to_scrape)}] {url}")
            self.scrape_profile(url)
            time.sleep(random.uniform(2, 5))
        print("Completed!")
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

    def close(self):
        self.driver.quit()


def main(urls=None):
    """
    Entry point for CLI or API. Accepts URLs optionally.
    Returns list of scraped profile dictionaries.
    """
    scraper = LinkedInScraper()
    try:
        profiles = scraper.scrape_all(urls)
        scraper.save_to_csv()
        return profiles
    finally:
        scraper.close()


if __name__ == "__main__":
    main()
