import argparse
import json
import os
from pathlib import Path

import requests


def load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return

    with dotenv_path.open() as dotenv_file:
        for raw_line in dotenv_file:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[len("export "):].strip()
            if "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch YoActiv service variations for a given service ID."
    )
    parser.add_argument("service_id", help="YoActiv service ID, e.g. 12345")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    load_dotenv(base_dir / ".env")

    api_key = os.environ.get("YOACTIV_API_KEY")
    branch_id = os.environ.get("YOACTIV_BRANCH_ID")

    if not api_key:
        print("Error: YOACTIV_API_KEY is missing in .env or environment variables.")
        return 1

    if not branch_id:
        print("Error: YOACTIV_BRANCH_ID is missing in .env or environment variables.")
        return 1

    url = "https://api.yoactiv.com/Billing/GetServiceVariations"
    payload = {"ServiceId": args.service_id}
    headers = {
        "API_Key": api_key,
        "Branch_Id": branch_id,
        "Content-Type": "application/json",
    }

    print("=" * 60)
    print("Service Variations")
    print("=" * 60)
    print(f"Service ID: {args.service_id}")
    print(f"Branch ID:  {branch_id}")

    try:
        response = requests.post(url, headers=headers, json=payload)

        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    except requests.exceptions.RequestException as exc:
        print(f"Request failed: {exc}")
        return 1

    print("\n" + "=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
