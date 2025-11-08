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


def install_chrome():
    """Download & install a portable Google Chrome binary for Render."""
    chrome_dir = "/opt/render/project/.chrome"
    chrome_binary = os.path.join(chrome_dir, "chrome-linux64", "chrome")

    if os.path.exists(chrome_binary):
        print("✅ Chrome already installed.", flush=True)
        return chrome_binary

    print("⬇️ Installing Google Chrome (headless)...", flush=True)
    os.makedirs(chrome_dir, exist_ok=True)

    # Use a stable Chrome-for-Testing build that matches the pinned driver version
    url = "https://storage.googleapis.com/chrome-for-testing-public/129.0.6668.100/linux64/chrome-linux64.zip"
    zip_path = os.path.join(chrome_dir, "chrome.zip")

    urllib.request.urlretrieve(url, zip_path)
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(chrome_dir)

    os.chmod(chrome_binary, 0o755)
    print(f"✅ Chrome installed at {chrome_binary}", flush=True)
    return chrome_binary


def setup_browser(use_proxy=False):
    chrome_path = install_chrome()
    chrome_options = Options()
    chrome_options.binary_location = chrome_path

    # 🧠 Randomize User-Agent
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
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])

    # 🧩 Essential flags for Render environment
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-sync")
    chrome_options.add_argument("--metrics-recording-only")
    chrome_options.add_argument("--no-first-run")
    chrome_options.add_argument("--no-default-browser-check")
    chrome_options.add_argument("--disable-client-side-phishing-detection")
    chrome_options.add_argument("--disable-component-update")
    chrome_options.add_argument("--disable-breakpad")
    chrome_options.add_argument("--password-store=basic")
    chrome_options.add_argument("--use-mock-keychain")

    # 🧩 Optional proxy
    if use_proxy and os.getenv("PROXY"):
        chrome_options.add_argument(f"--proxy-server={os.getenv('PROXY')}")

    # ✅ Use ChromeDriver pinned to same version
    driver_path = ChromeDriverManager(driver_version="129.0.6668.100").install()
    if "THIRD_PARTY_NOTICES" in driver_path:
        driver_path = os.path.join(os.path.dirname(driver_path), "chromedriver")

    # 🩵 Ensure the driver binary is executable
    try:
        os.chmod(driver_path, 0o755)
        print(f"✅ ChromeDriver permissions fixed at: {driver_path}", flush=True)
    except Exception as e:
        print(f"⚠️ Warning: could not chmod chromedriver: {e}", flush=True)

    print(f"✅ Using ChromeDriver binary at: {driver_path}", flush=True)

    service = Service(driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # 🕵️ Anti-detection tweaks
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

    print("🚀 Chrome browser initialized successfully.", flush=True)
    return driver
