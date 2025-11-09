"""
Data parsing utilities for LinkedIn profiles
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

def parse_profile(driver, url):
    """
    Parse LinkedIn profile and extract data
    """
    profile_data = {
        'url': url,
        'name': None,
        'headline': None,
        'location': None,
        # 'about': None,
        # 'company': None,
        'experience': None,
        # 'education': None,
        # 'skills': None,
        'connections': None
    }

    try:
        wait = WebDriverWait(driver, 10)

        # --- NAME (fixed selectors + fallback) ---
        try:
            name_element = wait.until(EC.presence_of_element_located((
                By.CSS_SELECTOR,
                'h1.text-heading-xlarge, h1.inline.t-24.v-align-middle.break-words'
            )))
            profile_data['name'] = name_element.text.strip()
        except Exception:
            try:
                fallback = driver.find_element(By.TAG_NAME, "h1")
                profile_data['name'] = fallback.text.strip()
            except:
                pass

        # --- HEADLINE ---
        try:
            headline_element = driver.find_element(By.CSS_SELECTOR, 'div.text-body-medium')
            profile_data['headline'] = headline_element.text.strip()
        except:
            pass

        # --- LOCATION ---
        try:
            location_element = driver.find_element(By.CSS_SELECTOR, 'span.text-body-small.inline')
            profile_data['location'] = location_element.text.strip()
        except:
            pass

        # --- CURRENT COMPANY (optional, often hidden) ---
        try:
            company_element = driver.find_element(By.CSS_SELECTOR, 'div.inline-show-more-text--is-collapsed span[aria-hidden="true"]')
            profile_data['company'] = company_element.text.strip()
        except:
            pass

        # --- CONNECTIONS ---
        try:
            connections_element = driver.find_element(By.CSS_SELECTOR, 'span.t-bold')
            profile_data['connections'] = connections_element.text.strip()
        except:
            pass

        # Scroll to load more content
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
        time.sleep(2)

        # --- ABOUT SECTION (expand "see more" if exists) ---
        try:
            try:
                see_more = driver.find_element(By.XPATH, "//button[contains(., 'see more')]")
                driver.execute_script("arguments[0].click();", see_more)
                time.sleep(1)
            except:
                pass

            about_element = driver.find_element(By.CSS_SELECTOR,
                'section.pv-about-section span[aria-hidden="true"], '
                'div.inline-show-more-text span[aria-hidden="true"]'
            )
            profile_data['about'] = about_element.text.strip()
        except:
            pass

        # --- EXPERIENCE (first listed position) ---
        try:
            experience_elements = driver.find_elements(By.CSS_SELECTOR, 'li.artdeco-list__item')
            if experience_elements:
                profile_data['experience'] = experience_elements[0].text.strip()[:300]
        except:
            pass

        # --- EDUCATION (first listed school, improved selector) ---
        try:
            education_elements = driver.find_elements(By.CSS_SELECTOR, 'section[data-section="education"] li')
            if education_elements:
                profile_data['education'] = education_elements[0].text.strip()[:300]
        except:
            pass

        # --- SKILLS (optional, if visible) ---
        try:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            skills = driver.find_elements(By.CSS_SELECTOR, '.pv-skill-category-entity__name-text')
            if skills:
                profile_data['skills'] = [s.text.strip() for s in skills[:10]]
        except:
            pass

        print(f"✓ Parsed: {profile_data['name'] or 'Unknown'}")

    except Exception as e:
        print(f"✗ Error parsing profile {url}: {str(e)}")

    return profile_data


def wait_for_element(driver, selector, timeout=10):
    """
    Wait for element to be present
    """
    try:
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        return element
    except TimeoutException:
        return None
