import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")

print("Testing health endpoint...")

r = requests.get(
    f"{BASE_URL}/health",
    timeout=10
)

print("Status:", r.status_code)
print(r.text)

print("\nTesting listings...")

r = requests.get(
    f"{BASE_URL}/v1/listings",
    params={
        "api_key": API_KEY,
        "page": 1,
        "limit": 5
    },
    timeout=10
)

print("Status:", r.status_code)
print(r.text[:5000])