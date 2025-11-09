import os
from dotenv import load_dotenv

load_dotenv()

LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL", "")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD", "")
PROFILE_URLS = [
    "https://www.linkedin.com/in/satyanadella",
    "https://www.linkedin.com/in/sundarpichai",
]
