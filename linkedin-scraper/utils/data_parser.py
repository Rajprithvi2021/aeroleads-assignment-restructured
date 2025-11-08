from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException

def safe_find(driver, by, selector, default=""):
    try:
        return driver.find_element(by, selector).text.strip()
    except NoSuchElementException:
        return default

def parse_profile(driver):
    return {
        "name": safe_find(driver, By.CSS_SELECTOR, "h1.text-heading-xlarge"),
        "headline": safe_find(driver, By.CSS_SELECTOR, "div.text-body-medium"),
        "location": safe_find(driver, By.CSS_SELECTOR, "span.text-body-small"),
        "about": safe_find(driver, By.CSS_SELECTOR, "div.display-flex.ph5.pv3"),
        "company": safe_find(driver, By.CSS_SELECTOR, "span.t-14.t-normal")
    }
