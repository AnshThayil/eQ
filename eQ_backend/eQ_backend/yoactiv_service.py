import os
from urllib.parse import urljoin

import requests


class YoActivAPIError(Exception):
    """Raised when a YoActiv API call fails."""


class YoActivClient:
    """Client for calling YoActiv CRM endpoints.

    Configurable via constructor arguments or environment variables:
    - YOACTIV_API_KEY
    - YOACTIV_BASE_URL
    """

    DEFAULT_BASE_URL = "https://api.yoactiv.com/"

    def __init__(self, api_key=None, branch_id=None, base_url=None, timeout=20):
        self.api_key = api_key or os.environ.get("YOACTIV_API_KEY")
        self.branch_id = branch_id
        self.base_url = (base_url or os.environ.get("YOACTIV_BASE_URL") or self.DEFAULT_BASE_URL).rstrip("/") + "/"
        self.timeout = timeout

        if not self.api_key:
            raise ValueError("YoActiv API key is required. Set YOACTIV_API_KEY or pass api_key.")
        if not self.branch_id:
            raise ValueError("YoActiv branch id is required. Pass branch_id.")

    @classmethod
    def from_gym(cls, gym, api_key=None, base_url=None, timeout=20):
        """Create a YoActiv client using a Gym object's branch_id."""
        branch_id = getattr(gym, 'branch_id', None)
        if not branch_id:
            raise ValueError("Gym object must have a branch_id to create a YoActivClient.")
        return cls(api_key=api_key, branch_id=branch_id, base_url=base_url, timeout=timeout)

    def _build_url(self, endpoint: str) -> str:
        if endpoint.startswith("http://") or endpoint.startswith("https://"):
            return endpoint
        return urljoin(self.base_url, endpoint.lstrip("/"))

    def _headers(self, extra_headers=None) -> dict:
        headers = {
            "API_Key": self.api_key,
            "Branch_Id": self.branch_id,
            "Content-Type": "application/json",
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def request(self, method: str, endpoint: str, *, params=None, json=None, headers=None, timeout=None):
        url = self._build_url(endpoint)
        request_headers = self._headers(headers)
        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                json=json,
                headers=request_headers,
                timeout=timeout or self.timeout,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            message = getattr(exc, "response", None)
            if message is not None:
                try:
                    error_body = message.json()
                except ValueError:
                    error_body = message.text
                raise YoActivAPIError(
                    f"YoActiv request failed: {message.status_code} {message.reason}. Response: {error_body}"
                ) from exc
            raise YoActivAPIError(f"YoActiv request failed: {exc}") from exc

        try:
            return response.json()
        except ValueError:
            return response.text

    def get(self, endpoint: str, *, params=None, headers=None, timeout=None):
        return self.request("GET", endpoint, params=params, headers=headers, timeout=timeout)

    def post(self, endpoint: str, *, json=None, params=None, headers=None, timeout=None):
        return self.request("POST", endpoint, params=params, json=json, headers=headers, timeout=timeout)

    def fetch_user(self, mobile_no: str, *, timeout=None):
        """Fetch a YoActiv user by mobile number."""
        payload = {"Mobile_No": mobile_no}
        return self.post("Users/Fetch", json=payload, timeout=timeout)

    def patch(self, endpoint: str, *, json=None, params=None, headers=None, timeout=None):
        return self.request("PATCH", endpoint, params=params, json=json, headers=headers, timeout=timeout)

    def delete(self, endpoint: str, *, params=None, headers=None, timeout=None):
        return self.request("DELETE", endpoint, params=params, headers=headers, timeout=timeout)


def get_yoactiv_user(mobile_no: str, gym, api_key=None, base_url=None, timeout=20):
    """Convenience helper to fetch a YoActiv user by mobile number using a Gym's branch id."""
    client = YoActivClient.from_gym(gym, api_key=api_key, base_url=base_url, timeout=timeout)
    return client.fetch_user(mobile_no)
