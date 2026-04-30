import requests
import json

get_inventory_url = "https://api.yoactiv.com/Billing/GetInventory"
api_key = "a4edabc99c05415091f78b198ba7be696848c45ca3d54e1cb15bdf2efa54c24f"
branch_ids = ["6934", "6978", "7506"]

inventory_payload = {}

print("=" * 60)
print("Inventory by Branch ID")
print("=" * 60)

for branch_id in branch_ids:
    headers = {
        "API_Key": api_key,
        "Branch_Id": branch_id,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            get_inventory_url,
            headers=headers,
            json=inventory_payload
        )

        print(f"\nBranch ID: {branch_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed for Branch {branch_id}: {e}")

print("\n" + "=" * 60)
