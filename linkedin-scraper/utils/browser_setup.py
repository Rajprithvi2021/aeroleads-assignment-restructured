# utils/browser_setup.py
import os
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent


def setup_browser(use_proxy=False):
    chrome_options = Options()

    # 🧠 Use a random User-Agent
    try:
        ua = UserAgent()
        user_agent = ua.random
    except Exception:
        # fallback if fake_useragent cache fails
        fallback_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36"
        ]
        user_agent = random.choice(fallback_agents)

    chrome_options.add_argument(f"user-agent={user_agent}")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--start-maximized")
    # comment this if you want visible browser window:
    chrome_options.add_argument("--headless=new")

    # 🧩 Optional proxy support
    if use_proxy and os.getenv("PROXY"):
        chrome_options.add_argument(f"--proxy-server={os.getenv('PROXY')}")

    # ✅ Get valid ChromeDriver binary only
    driver_path = ChromeDriverManager().install()
    if "THIRD_PARTY_NOTICES" in driver_path:
        # if webdriver_manager returns a bad file, correct it
        driver_path = os.path.join(os.path.dirname(driver_path), "chromedriver")
    print(f"✅ Using ChromeDriver binary at: {driver_path}")

    service = Service(driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # 🕵️ Stealth tweaks
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                window.chrome = { runtime: {} };
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
            """
        },
    )

    return driver
