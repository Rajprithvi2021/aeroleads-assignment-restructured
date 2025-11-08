# utils/data_parser.py
import re
import time
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Noise we never want to treat as company/about
NOISE_PATTERNS = re.compile(
    r"(mutual connection|mutual connections|followers?|following|contact info|"
    r"activity|connections|followed by|other s|others|\d{1,3}(,\d{3})*\+?\s*(followers|connections))",
    re.IGNORECASE,
)

def clean_text(txt: str) -> str:
    if not txt:
        return ""
    txt = re.sub(r"\s+", " ", txt).strip()
    txt = NOISE_PATTERNS.sub("", txt).strip(" -•|·,")
    return txt

def _first_text(driver, selectors):
    """Try a list of (By, selector) and return first non-empty innerText."""
    for by, sel in selectors:
        try:
            if not sel or not sel.strip():
                continue
            el = driver.find_element(by, sel)
            txt = el.get_attribute("innerText") or el.text
            txt = clean_text(txt)
            if txt:
                return txt
        except NoSuchElementException:
            continue
        except Exception:
            continue
    return ""

def _find(driver, by, sel, timeout=8):
    if not sel or not sel.strip():
        return None
    try:
        wait = WebDriverWait(driver, timeout)
        return wait.until(EC.presence_of_element_located((by, sel)))
    except Exception:
        return None

def _click_if_present(driver, by, sel):
    try:
        el = driver.find_element(by, sel)
        driver.execute_script("arguments[0].click();", el)
        time.sleep(0.3)
        return True
    except Exception:
        return False

def _scroll_into_view(driver, el):
    try:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        time.sleep(0.25)
    except Exception:
        pass

def _expand_about(driver):
    """
    Scroll to About, click 'See more' if present, return about container element.
    Compatible with new and legacy layouts.
    """
    # Scroll some to trigger lazy load
    driver.execute_script("window.scrollBy(0, 800);")
    time.sleep(0.6)

    # Try new layout first (section with id containing 'about')
    about = _find(driver, By.CSS_SELECTOR, "section[id*='about']")
    if not about:
        # Fallback: section whose heading contains 'About'
        about = _find(driver, By.XPATH, "//section[.//h2[contains(., 'About')]]")

    if about:
        _scroll_into_view(driver, about)
        # Click 'See more' inside about
        _click_if_present(driver, By.XPATH, ".//button[contains(., 'See more') or @aria-expanded='false']")
    return about

def _extract_about_text(about_section):
    if not about_section:
        return ""
    # Grab visible text blocks commonly used in About
    blocks = about_section.find_elements(By.CSS_SELECTOR, "div.inline-show-more-text, .display-flex .break-words, p, span")
    parts = []
    for b in blocks:
        txt = clean_text((b.get_attribute("innerText") or b.text or "").strip())
        if txt:
            parts.append(txt)
    # Deduplicate and join
    seen = set()
    out = []
    for p in parts:
        if p.lower() not in seen and len(p) > 3:
            out.append(p)
            seen.add(p.lower())
    return " ".join(out).strip()

def _extract_company_from_experience(driver):
    """
    Strictly parse the first Experience list item.
    We scope to the Experience section to avoid 'Followed by ...' lines.
    """
    # Ensure experience section is visible
    driver.execute_script("window.scrollBy(0, 1200);")
    time.sleep(0.6)

    # Find experience section (new and legacy)
    exp_section = _find(
        driver,
        By.XPATH,
        "//section[contains(@id,'experience') or contains(@class,'experience') or @data-view-name='profile-experience']"
    )
    if not exp_section:
        return ""

    _scroll_into_view(driver, exp_section)

    # First experience list item (new pvs cards)
    first_item = None
    for sel in [
        ".pvs-list__outer-container ul.pvs-list > li.pvs-list__item",
        "ul.pvs-list > li.pvs-list__item",
        "li.pv-profile-section__list-item",  # legacy
    ]:
        try:
            first_item = exp_section.find_element(By.CSS_SELECTOR, sel)
            break
        except NoSuchElementException:
            continue
        except Exception:
            continue

    if not first_item:
        return ""

    # Within the first item, company name typically appears inside a 't-14 t-normal' row,
    # and the human-readable text is under a span[aria-hidden='true'].
    candidates = []
    for sel in [
        ".t-14.t-normal span[aria-hidden='true']",
        ".t-14.t-normal.t-black--light span[aria-hidden='true']",
        "span.t-14.t-normal",
        ".pv-entity__secondary-title",  # legacy
        ".display-flex .mr1 span[aria-hidden='true']",
    ]:
        try:
            els = first_item.find_elements(By.CSS_SELECTOR, sel)
            for el in els:
                txt = clean_text((el.get_attribute("innerText") or el.text or "").strip())
                if txt and not NOISE_PATTERNS.search(txt):
                    candidates.append(txt)
        except Exception:
            continue

    # Heuristic: prefer the shortest non-noise candidate (company names are short)
    candidates = [c for c in candidates if 2 <= len(c) <= 80]
    if not candidates:
        return ""
    # Remove duplicates while preserving order
    seen = set()
    uniq = []
    for c in candidates:
        if c.lower() not in seen:
            uniq.append(c)
            seen.add(c.lower())

    # Filter out obvious role titles accidentally captured
    for c in uniq:
        if not any(bad in c.lower() for bad in ["followed by", "mutual", "connection", "follower", "others"]):
            return c
    return uniq[0] if uniq else ""

def parse_profile(driver):
    wait = WebDriverWait(driver, 8)

    # Ensure main profile header is present
    try:
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "main, #profile-content, .core-rail, .pv-profile-wrapper")
            )
        )
    except TimeoutException:
        pass

    # --- NAME ---
    name = _first_text(
        driver,
        [
            (By.CSS_SELECTOR, "h1"),  # valid and robust
            (By.CSS_SELECTOR, "div[data-view-name='profile-card'] h1"),
            (By.CSS_SELECTOR, ".pv-text-details__left-panel h1"),
            (By.CSS_SELECTOR, "section.artdeco-card h1"),
        ],
    )

    # --- HEADLINE ---
    headline = _first_text(
        driver,
        [
            (By.CSS_SELECTOR, ".text-body-medium.break-words"),
            (By.CSS_SELECTOR, "div[data-view-name='profile-card'] .text-body-medium"),
            (By.CSS_SELECTOR, ".pv-text-details__left-panel .text-body-medium"),
        ],
    )

    # --- LOCATION ---
    location = _first_text(
        driver,
        [
            (By.CSS_SELECTOR, ".pv-top-card--list-bullet li"),
            (By.CSS_SELECTOR, ".pv-top-card__location"),
            (By.CSS_SELECTOR, "span.text-body-small.inline.t-black--light.break-words"),
        ],
    )
    if location and ("followers" in location.lower() or "connection" in location.lower()):
        location = ""

    # --- ABOUT ---
    about = ""
    about_section = _expand_about(driver)
    about = _extract_about_text(about_section)
    # very short abouts are often junk; drop them
    if about and len(about) < 10:
        about = ""

    # --- COMPANY (first Experience card only) ---
    company = _extract_company_from_experience(driver)

    return {
        "name": name or "",
        "headline": headline or "",
        "location": location or "",
    }
