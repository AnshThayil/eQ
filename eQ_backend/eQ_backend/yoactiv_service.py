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

    def get_user_list(self, *, timeout=None):
        """Fetch all users in the branch from YoActiv."""
        return self.post("Users/GetUserList", json={}, timeout=timeout)

    def get_class_schedule(self, date_str: str, *, timeout=None):
        """Fetch the class schedule for a date via Classes/Schedule.

        date_str must be YYYY-MM-DD.
        """
        return self.post("Classes/Schedule", json={"Date": date_str}, timeout=timeout)

    def get_class_enrollments(self, date_str: str, class_id, *, timeout=None):
        """Fetch enrollments for a class instance via Classes/Enrollments.

        date_str must be YYYY-MM-DD. class_id is the YoActiv Class_Id.
        """
        try:
            enrollment_id = int(class_id)
        except (TypeError, ValueError):
            enrollment_id = class_id
        return self.post(
            "Classes/Enrollments",
            json={"Date": date_str, "Id": enrollment_id},
            timeout=timeout,
        )

    def reserve_classes(self, member_id, reserves, *, timeout=None):
        """Book a member into one or more class instances via Classes/Reserve.

        reserves is a list of dicts with Class_Date (YYYY-MM-DD date only) and Class_Id.
        """
        try:
            mid = int(member_id)
        except (TypeError, ValueError):
            mid = member_id
        normalized = []
        for item in reserves or []:
            if not isinstance(item, dict):
                continue
            class_id = item.get("Class_Id", item.get("class_id"))
            class_date = item.get("Class_Date", item.get("class_date"))
            if class_id in (None, "") or not class_date:
                continue
            try:
                class_id = int(class_id)
            except (TypeError, ValueError):
                pass
            # YoActiv expects a calendar date only (e.g. 2026-07-11), never a datetime.
            date_only = str(class_date).strip().replace("/", "-")
            if "T" in date_only:
                date_only = date_only.split("T", 1)[0]
            elif " " in date_only:
                date_only = date_only.split(" ", 1)[0]
            # Normalize D-M-YYYY / DD-MM-YYYY to YYYY-MM-DD when needed.
            parts = date_only.split("-")
            if len(parts) == 3 and len(parts[0]) <= 2 and len(parts[2]) == 4:
                day, month, year = parts[0].zfill(2), parts[1].zfill(2), parts[2]
                date_only = f"{year}-{month}-{day}"
            normalized.append({"Class_Date": date_only, "Class_Id": class_id})
        return self.post(
            "Classes/Reserve",
            json={"Member_Id": mid, "Reserve": normalized},
            timeout=timeout,
        )

    def cancel_reservation(self, member_id, class_book_id, *, timeout=None):
        """Cancel a class booking via Classes/ReserveCancel."""
        try:
            mid = int(member_id)
        except (TypeError, ValueError):
            mid = member_id
        try:
            book_id = int(class_book_id)
        except (TypeError, ValueError):
            book_id = class_book_id
        return self.post(
            "Classes/ReserveCancel",
            json={"Member_Id": mid, "ClassBook_Id": book_id},
            timeout=timeout,
        )

    def save_bill(self, *, service_variation_id, start_date, end_date, amount,
                  paid, transaction_id, purchase_date, country_code="+91",
                  mobile, sales_staff_id=0, pt_staff_id=0, timeout=None):
        """Record a completed sale in YoActiv via Billing/SaveBill.

        Dates must be strings in DD-MM-YYYY format.
        Amount and paid are in the currency unit (e.g. rupees, not paise).
        """
        payload = {
            "ServiceDetails": [
                {
                    "serviceVariationid": service_variation_id,
                    "StartDate": start_date,
                    "EndDate": end_date,
                    "amount": amount,
                    "discountAmount": 0,
                }
            ],
            "Paid": paid,
            "TransactionID": transaction_id,
            "Purchagedate": purchase_date,
            "SalesStfid": sales_staff_id,
            "PtStfid": pt_staff_id,
            "CountryCode": country_code,
            "Mobile": mobile,
        }
        return self.post("Billing/SaveBill", json=payload, timeout=timeout)

    def patch(self, endpoint: str, *, json=None, params=None, headers=None, timeout=None):
        return self.request("PATCH", endpoint, params=params, json=json, headers=headers, timeout=timeout)

    def delete(self, endpoint: str, *, params=None, headers=None, timeout=None):
        return self.request("DELETE", endpoint, params=params, headers=headers, timeout=timeout)


def get_yoactiv_user(mobile_no: str, gym, api_key=None, base_url=None, timeout=20):
    """Convenience helper to fetch a YoActiv user by mobile number using a Gym's branch id."""
    client = YoActivClient.from_gym(gym, api_key=api_key, base_url=base_url, timeout=timeout)
    return client.fetch_user(mobile_no)
