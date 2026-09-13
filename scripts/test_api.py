import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")
EMAIL = os.getenv("DEMO_EMAIL")
PASSWORD = os.getenv("DEMO_PASSWORD")


# --------------------------------------------------
# API KEY HEADER
# --------------------------------------------------

api_headers = {
    "X-API-Key": API_KEY
}


# --------------------------------------------------
# HEALTH
# --------------------------------------------------

print("Testing health endpoint...")

response = requests.get(
    f"{BASE_URL}/health",
    timeout=10
)

print("Status:", response.status_code)
print(response.text)


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

print("\nLogging in...")

response = requests.post(
    f"{BASE_URL}/auth/login",
    headers=api_headers,
    json={
        "email": EMAIL,
        "password": PASSWORD
    },
    timeout=10
)

print("Login status:", response.status_code)

login_data = response.json()

print("Login response keys:", list(login_data.keys()))


if response.status_code != 200:
    print("Login failed:")
    print(login_data)
    raise SystemExit


# --------------------------------------------------
# REAL API USES access_token
# --------------------------------------------------

token = login_data["access_token"]

print("\nLogin successful!")
print("Token received successfully.")


# --------------------------------------------------
# AUTHENTICATED REQUEST HEADERS
# --------------------------------------------------

headers = {
    "X-API-Key": API_KEY,
    "Authorization": f"Bearer {token}"
}


# --------------------------------------------------
# LISTINGS
# --------------------------------------------------

print("\nTesting listings...")

response = requests.get(
    f"{BASE_URL}/v1/listings",
    headers=headers,
    params={
        "page": 1,
        "limit": 5
    },
    timeout=20
)

print("Listings status:", response.status_code)
print("URL:", response.url)

try:
    data = response.json()
    print("\nListings response:")
    print(data)
except Exception:
    print(response.text)