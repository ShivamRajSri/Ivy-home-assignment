import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")
EMAIL = os.getenv("DEMO_EMAIL")
PASSWORD = os.getenv("DEMO_PASSWORD")


# ============================================================
# LOGIN
# ============================================================

def login():

    print("Logging in...")

    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers={
            "X-API-Key": API_KEY
        },
        json={
            "email": EMAIL,
            "password": PASSWORD
        },
        timeout=20
    )

    response.raise_for_status()

    data = response.json()

    print("Login successful")
    print("Token expires in:", data.get("expires_in"), "seconds")

    return data["access_token"]


# ============================================================
# CREATE SESSION
# ============================================================

token = login()

session = requests.Session()

session.headers.update({
    "X-API-Key": API_KEY,
    "Authorization": f"Bearer {token}"
})


# ============================================================
# FETCH ALL RECORDS
# ============================================================

def fetch_all(endpoint):

    print("\n")
    print("=" * 70)
    print("DOWNLOADING:", endpoint)
    print("=" * 70)

    limit = 200
    offset = 0

    all_records = []

    while True:

        print(
            f"Requesting offset={offset}, limit={limit}..."
        )

        response = session.get(
            BASE_URL + endpoint,
            params={
                "limit": limit,
                "offset": offset
            },
            timeout=30
        )

        # ----------------------------------------------------
        # Handle unexpected authentication expiration
        # ----------------------------------------------------

        if response.status_code == 401:

            print("Token expired. Logging in again...")

            new_token = login()

            session.headers.update({
                "Authorization": f"Bearer {new_token}"
            })

            response = session.get(
                BASE_URL + endpoint,
                params={
                    "limit": limit,
                    "offset": offset
                },
                timeout=30
            )

        # ----------------------------------------------------
        # Check errors
        # ----------------------------------------------------

        if response.status_code != 200:

            print("ERROR")
            print("Status:", response.status_code)
            print(response.text)

            response.raise_for_status()

        data = response.json()

        # ----------------------------------------------------
        # Inspect actual response structure
        # ----------------------------------------------------

        records = data.get("results", [])

        total = data.get("total")

        count = data.get("count")

        has_more = data.get("has_more")

        actual_offset = data.get("offset")

        actual_limit = data.get("limit")

        print(
            f"received={len(records)} "
            f"count={count} "
            f"total={total} "
            f"offset={actual_offset} "
            f"limit={actual_limit} "
            f"has_more={has_more}"
        )

        all_records.extend(records)

        # ----------------------------------------------------
        # Stop condition
        # ----------------------------------------------------

        if not has_more:
            break

        offset += len(records)

        # Safety check
        if len(records) == 0:
            print("No records returned while has_more=True.")
            break

        time.sleep(0.05)

    print()
    print("Finished:", endpoint)
    print("Total downloaded:", len(all_records))

    return all_records


# ============================================================
# DOWNLOAD DATA
# ============================================================

os.makedirs("data", exist_ok=True)

listings = fetch_all("/v1/listings")

rentals = fetch_all("/v1/rentals")

projects = fetch_all("/v1/projects")


# ============================================================
# SAVE DATA
# ============================================================

with open("data/listings.json", "w", encoding="utf-8") as f:

    json.dump(
        listings,
        f,
        indent=2,
        ensure_ascii=False
    )


with open("data/rentals.json", "w", encoding="utf-8") as f:

    json.dump(
        rentals,
        f,
        indent=2,
        ensure_ascii=False
    )


with open("data/projects.json", "w", encoding="utf-8") as f:

    json.dump(
        projects,
        f,
        indent=2,
        ensure_ascii=False
    )


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("DOWNLOAD COMPLETE")
print("=" * 70)

print("Listings :", len(listings))
print("Rentals  :", len(rentals))
print("Projects :", len(projects))

print()
print("Saved:")
print("data/listings.json")
print("data/rentals.json")
print("data/projects.json")