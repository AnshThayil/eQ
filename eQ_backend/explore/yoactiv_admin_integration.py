"""
Utilities for integrating YoActiv API with Django admin for dynamic service selection.
Fetches live services and variations from YoActiv to populate admin dropdowns.
"""

import os
from typing import List, Tuple, Dict, Any

from eQ_backend.yoactiv_service import YoActivClient, YoActivAPIError


def get_yoactiv_api_credentials() -> Tuple[str, str]:
    """
    Get YoActiv API key and a default branch ID from environment.
    
    Returns:
        Tuple of (api_key, branch_id)
    
    Raises:
        ValueError: If required credentials are not set
    """
    api_key = os.environ.get("YOACTIV_API_KEY")
    branch_id = os.environ.get("YOACTIV_BRANCH_ID")
    
    if not api_key:
        raise ValueError("YOACTIV_API_KEY environment variable is not set")
    if not branch_id:
        raise ValueError("YOACTIV_BRANCH_ID environment variable is not set")
    
    return api_key, branch_id


def fetch_yoactiv_services(branch_id: str = None) -> List[Dict[str, Any]]:
    """
    Fetch all services from YoActiv for a given branch.
    
    Args:
        branch_id: YoActiv branch ID. If not provided, uses YOACTIV_BRANCH_ID from env.
    
    Returns:
        List of service dictionaries with 'serviceId' and 'serviceName' keys
    
    Raises:
        YoActivAPIError: If API call fails
    """
    if not branch_id:
        _, branch_id = get_yoactiv_api_credentials()
    
    api_key, _ = get_yoactiv_api_credentials()
    client = YoActivClient(api_key=api_key, branch_id=branch_id)
    
    try:
        response = client.post("Billing/GetServices", json={})
        
        # Parse nested response structure
        data = response.get("Data", {})
        if isinstance(data, dict):
            services_data = data.get("Services", [])
        else:
            services_data = []
        
        # Filter to only valid service dicts
        services = []
        if isinstance(services_data, list):
            for service in services_data:
                if isinstance(service, dict):
                    service_id = service.get("serviceId")
                    service_name = service.get("serviceName")
                    if service_id and service_name:
                        services.append({
                            "serviceId": str(service_id),
                            "serviceName": service_name
                        })
        
        return services
    
    except YoActivAPIError as e:
        raise YoActivAPIError(f"Failed to fetch services from YoActiv: {e}")


def fetch_yoactiv_variations(
    service_id: str, 
    branch_id: str = None
) -> List[Dict[str, Any]]:
    """
    Fetch all variations for a specific service from YoActiv.
    
    Args:
        service_id: YoActiv service ID
        branch_id: YoActiv branch ID. If not provided, uses YOACTIV_BRANCH_ID from env.
    
    Returns:
        List of variation dictionaries with 'serviceId', 'ServiceVariation', and 'amount' keys
    
    Raises:
        YoActivAPIError: If API call fails
    """
    if not branch_id:
        _, branch_id = get_yoactiv_api_credentials()
    
    api_key, _ = get_yoactiv_api_credentials()
    client = YoActivClient(api_key=api_key, branch_id=branch_id)
    
    try:
        payload = {"ServiceId": service_id}
        response = client.post("Billing/GetServiceVariations", json=payload)
        
        # Parse nested response structure
        data = response.get("Data", {})
        if isinstance(data, dict):
            variations_data = data.get("ServiceVariations", [])
        else:
            variations_data = []
        
        # Filter to only valid variation dicts
        variations = []
        if isinstance(variations_data, list):
            for variation in variations_data:
                if isinstance(variation, dict):
                    variation_id = variation.get("serviceVariationId")
                    if variation_id is None:
                        variation_id = variation.get("ServiceVariationId")
                    if variation_id is None:
                        variation_id = variation.get("service_variation_id")
                    var_name = variation.get("ServiceVariation")
                    var_amount = variation.get("amount")
                    if variation_id is not None and var_name and var_amount is not None:
                        variations.append({
                            "serviceId": str(service_id),
                            "ServiceVariation": var_name,
                            "amount": var_amount,
                            "id": str(variation_id)
                        })
        
        return variations
    
    except YoActivAPIError as e:
        raise YoActivAPIError(f"Failed to fetch variations for service {service_id}: {e}")


def get_service_choices(branch_id: str = None) -> List[Tuple[str, str]]:
    """
    Get service choices formatted for Django choice fields.
    
    Args:
        branch_id: YoActiv branch ID. If not provided, uses YOACTIV_BRANCH_ID from env.
    
    Returns:
        List of (service_id, display_name) tuples
    """
    try:
        services = fetch_yoactiv_services(branch_id)
        return [
            (service["serviceId"], service["serviceName"])
            for service in services
        ]
    except (YoActivAPIError, ValueError):
        # Return empty list if API is unavailable (e.g., in testing)
        return []


def get_variation_choices(service_id: str, branch_id: str = None) -> List[Tuple[str, str]]:
    """
    Get service variation choices formatted for Django choice fields.
    
    Args:
        service_id: YoActiv service ID
        branch_id: YoActiv branch ID. If not provided, uses YOACTIV_BRANCH_ID from env.
    
    Returns:
        List of (variation_id, display_name) tuples
    """
    if not service_id:
        return []
    
    try:
        variations = fetch_yoactiv_variations(service_id, branch_id)
        return [
            (variation["id"], f"{variation['ServiceVariation']} (₹{variation['amount']})")
            for variation in variations
        ]
    except (YoActivAPIError, ValueError):
        # Return empty list if API is unavailable
        return []
