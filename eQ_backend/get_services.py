import requests
import json

get_services_url = "https://api.yoactiv.com/Billing/GetServices"
get_variations_url = "https://api.yoactiv.com/Billing/GetServiceVariations"
api_key = "a4edabc99c05415091f78b198ba7be696848c45ca3d54e1cb15bdf2efa54c24f"
branch_ids = ["6934", "6978", "7506"]
# branch_ids = ["7506"]

services_payload = {}

print("=" * 60)
print("Services and Variations by Branch ID")
print("=" * 60)

for branch_id in branch_ids:
    headers = {
        "API_Key": api_key,
        "Branch_Id": branch_id,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            get_services_url,
            headers=headers,
            json=services_payload
        )

        print(f"\nBranch ID: {branch_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract services - handling the Data.Services structure
            if isinstance(data, dict) and "Data" in data:
                services_data = data["Data"]
                if isinstance(services_data, dict) and "Services" in services_data:
                    services = services_data["Services"]
                    if isinstance(services, list):
                        print("Services:")
                        for service in services:
                            if isinstance(service, dict):
                                service_name = service.get("serviceName", "Unknown")
                                service_id = service.get("serviceId")
                                print(f"\n  Service: {service_name} (ID: {service_id})")
                                
                                # Fetch variations for this service
                                if service_id:
                                    var_payload = {"ServiceId": service_id}
                                    try:
                                        var_response = requests.post(
                                            get_variations_url,
                                            headers=headers,
                                            json=var_payload
                                        )
                                        
                                        if var_response.status_code == 200:
                                            var_data = var_response.json()
                                            if isinstance(var_data, dict) and "Data" in var_data:
                                                var_inner = var_data["Data"]
                                                if isinstance(var_inner, dict) and "ServiceVariations" in var_inner:
                                                    variations = var_inner["ServiceVariations"]
                                                    if isinstance(variations, list):
                                                        print("    Variations:")
                                                        for variation in variations:
                                                            if isinstance(variation, dict):
                                                                var_name = variation.get("ServiceVariation", "Unknown")
                                                                var_amount = variation.get("amount", "N/A")
                                                                var_id = variation.get("serviceVariationId")
                                                                print(f"      - {var_name} (₹{var_amount}) [ID: {var_id}]")
                                                            else:
                                                                print(f"      - {variation}")
                                                    else:
                                                        print(f"    No variations")
                                                else:
                                                    print(f"    No variations")
                                            else:
                                                print(f"    Error parsing response")
                                        else:
                                            print(f"    Error fetching variations: {var_response.text}")
                                    
                                    except requests.exceptions.RequestException as e:
                                        print(f"    Request failed: {e}")
                            else:
                                print(f"  - {service}")
                    else:
                        print(json.dumps(data, indent=2))
                else:
                    print(json.dumps(data, indent=2))
            else:
                print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed for Branch {branch_id}: {e}")

print("\n" + "=" * 60)
