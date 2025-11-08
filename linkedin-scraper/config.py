import os
from dotenv import load_dotenv
load_dotenv()

LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL", "test@example.com")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD", "password")
PROFILE_URLS = [
    "https://www.linkedin.com/in/satyanadella",
    "https://www.linkedin.com/in/jeffweiner08",
    "https://www.linkedin.com/in/williamhgates",
    "https://www.linkedin.com/in/reidhoffman",
    "https://www.linkedin.com/in/sundarpichai",
    "https://www.linkedin.com/in/sherylsandberg",
    "https://www.linkedin.com/in/timcook",
    "https://www.linkedin.com/in/marissamayer",
    "https://www.linkedin.com/in/danielek",
    "https://www.linkedin.com/in/drew-houston-93619",
    "https://www.linkedin.com/in/sheikh-mohd-shoaib/",
    "https://www.linkedin.com/in/bukke-leeladhar-586333278/",
    "https://www.linkedin.com/in/johnzimmer",
    "https://www.linkedin.com/in/melanie-perkins-12a1b854",
    "https://www.linkedin.com/in/tony-xu-5b1ba05",
    "https://www.linkedin.com/in/apoorva-mehta-4a8826",
    "https://www.linkedin.com/in/stewart-butterfield-63b7876",
    "https://www.linkedin.com/in/dylan-field",
    "https://www.linkedin.com/in/sriramkrishnan",
    "https://www.linkedin.com/in/dharmesh-shah"
]
USE_PROXY = False
HEADLESS = False
