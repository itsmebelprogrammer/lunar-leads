import time
import phonenumbers
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def format_e164(phone_raw: str) -> str | None:
    try:
        parsed = phonenumbers.parse(phone_raw, "BR")
        if phonenumbers.is_valid_number(parsed):
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except Exception:
        pass
    return None

def scrape_google_maps(niche_label: str, state_name: str, limit: int = 50) -> list[dict]:
    query = f"{niche_label} em {state_name}"

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--lang=pt-BR")
    opts.add_argument("--page-load-strategy=eager")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts
    )
    driver.set_page_load_timeout(30)
    driver.set_script_timeout(30)
    driver.implicitly_wait(5)

    leads = []
    try:
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        driver.get(url)
        time.sleep(3)

        # Scroll para carregar resultados — máximo 30s
        try:
            scrollable = driver.find_element(By.CSS_SELECTOR, "div[role='feed']")
            last_count = 0
            scroll_start = time.time()
            for _ in range(15):
                if time.time() - scroll_start > 30:
                    break
                driver.execute_script("arguments[0].scrollTop += 2000", scrollable)
                time.sleep(1.5)
                items = driver.find_elements(By.CSS_SELECTOR, "a.hfpxzc")
                if len(items) >= limit or len(items) == last_count:
                    break
                last_count = len(items)
        except Exception:
            pass

        items = driver.find_elements(By.CSS_SELECTOR, "a.hfpxzc")
        for item in items[:limit]:
            name = item.get_attribute("aria-label") or ""
            if not name:
                continue

            try:
                item.click()
                time.sleep(1.5)
            except Exception:
                continue

            phone_raw, website = None, None
            try:
                phone_el  = driver.find_element(By.CSS_SELECTOR, "button[data-item-id^='phone']")
                phone_raw = phone_el.get_attribute("data-item-id").replace("phone:tel:", "")
            except Exception:
                pass
            try:
                web_el  = driver.find_element(By.CSS_SELECTOR, "a[data-item-id='authority']")
                website = web_el.get_attribute("href")
            except Exception:
                pass

            phone_e164 = format_e164(phone_raw) if phone_raw else None
            whatsapp   = f"https://wa.me/{phone_e164.replace('+', '')}" if phone_e164 else None

            leads.append({
                "name":       name,
                "phone":      phone_raw,
                "phone_e164": phone_e164,
                "website":    website,
                "whatsapp":   whatsapp,
            })
    finally:
        driver.quit()

    return leads