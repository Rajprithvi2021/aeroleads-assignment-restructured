# scraper_selenium.py
import time
import pandas as pd
from config import LINKEDIN_EMAIL, LINKEDIN_PASSWORD, PROFILE_URLS
from browser_utils import create_browser   # 👈 rename 14356566...py → browser_utils.py
from parser_utils import parse_profile     # 👈 rename 593cdf4c...py → parser_utils.py
from selenium.webdriver.common.by import By

def login_linkedin(driver):
    """
    Log in to LinkedIn using credentials from config.py
    """
    driver.get("https://www.linkedin.com/login")
    time.sleep(2)

    email_input = driver.find_element(By.ID, "username")
    password_input = driver.find_element(By.ID, "password")
    email_input.send_keys(LINKEDIN_EMAIL)
    password_input.send_keys(LINKEDIN_PASSWORD)

    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    time.sleep(3)

    print("🔐 Logged in successfully (check manually if CAPTCHA).")
    print("Current URL:", driver.current_url)


def scrape_profiles():
    """
    Login and scrape LinkedIn profiles using modular browser + parser.
    """
    driver = create_browser(headless=False)   # 🧩 headless=False for first run (debug)
    login_linkedin(driver)

    results = []

    for url in PROFILE_URLS:
        driver.get(url)
        time.sleep(3)

        profile_data = parse_profile(driver, url)
        results.append(profile_data)

    driver.quit()

    df = pd.DataFrame(results)
    df.to_csv("linkedin_profiles.csv", index=False)
    print("✅ Saved to linkedin_profiles.csv")
    return df


if __name__ == "__main__":
    scrape_profiles()
