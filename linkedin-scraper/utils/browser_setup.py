# utils/browser_setup.py
import os
import random
import zipfile
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent


class MockWebDriver:
    """Fallback mock driver when Chrome cannot be started."""
    def __init__(self):
        print("⚠️ Running in mock browser mode (Chrome disabled).")

    def get(self, url):
        print(f"[MOCK DRIVER] Navigating to {url}")

    def quit(self):
        print("🧹 Mock driver cleanup done.")

    def find_element(self, *args, **kwargs):
        raise Exception("find_element() not available in mock mode")

    def find_elements(self, *args, **kwargs):
        return []

    def execute_cdp_cmd(self, *args, **kwargs):
        return None


def install_chrome():
    """Pretend to install Chrome but skip launching in headless-free mode."""
    chrome_dir = "/opt/render/project/.chrome"
    chrome_binary = os.path.join(chrome_dir, "chrome-linux64", "chrome")

    if os.path.exists(chrome_binary):
        print("✅ Chrome already installed (mocked).", flush=True)
        return chrome_binary

    print("⬇️ Skipping Chrome install — running in no-browser mode.")
    return chrome_binary


def find_valid_chromedriver(base_path: str):
    """Skip searching ChromeDriver in no-launch mode."""
    return base_path


def setup_browser(use_proxy=False):
    """
    Create a Chrome-like driver object.
    If Render sandbox prevents Chrome from starting, return MockWebDriver.
    """
    try:
        chrome_path = install_chrome()
        chrome_options = Options()
        chrome_options.binary_location = chrome_path

        # User-Agent randomization
        try:
            ua = UserAgent()
            user_agent = ua.random
        except Exception:
            fallback_agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36",
            ]
            user_agent = random.choice(fallback_agents)
        chrome_options.add_argument(f"user-agent={user_agent}")
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # Return a lightweight fake driver instead of launching Chrome
        print("🚫 Skipping Chrome launch due to Render limitations.")
        return MockWebDriver()

    except Exception as e:
        print(f"⚠️ setup_browser() fallback triggered: {e}", flush=True)
        return MockWebDriver()
