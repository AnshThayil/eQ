# CRM Integration API Spec

## Overview
This document defines a simple REST API that your backend will use to query the CRM for user service cards, users (with phone numbers), gyms, gym services, and gym POS items. The spec assumes the CRM exposes these resources; adjust field names to match the CRM's actual responses.

Base URL (example)
- https://api.crm.example.com/v1

## Authentication
- Preferred: Bearer token via `Authorization: Bearer <TOKEN>` header.
- Alternative: API key via `X-Api-Key: <KEY>` header.

## Common headers
- `Accept: application/json`
- `Content-Type: application/json` (for POST/PUT)

## Pagination
- Use `limit` and `offset` query parameters. Default: `limit=50`, `offset=0`.
- Responses that return lists include a `meta` object with `total`, `limit`, `offset`.

Example params:
- `?limit=100&offset=0`

## Error handling
- 400 Bad Request — invalid query
- 401 Unauthorized — bad/missing auth
- 403 Forbidden — insufficient permissions
- 404 Not Found — resource not found
- 429 Too Many Requests — rate limited
- 500 Internal Server Error — CRM error

Errors follow this JSON shape:
{
  "error": {
    "code": "string",
    "message": "string",
    "details": null
  }
}

---

**Endpoints**

### 1) GET /users
Get all users with their phone number and corresponding userID.

- Method: GET
- Path: `/users`
- Query params:
  - `fields` (optional) — comma-separated fields to return; e.g. `userId,phone,email`.
  - `limit` (optional) — integer
  - `offset` (optional) — integer
  - `search` (optional) — search term for names or phone
- Response 200:
{
  "data": [
    {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "+15551234567",
      "email": "user@example.com"
    }
  ],
  "meta": {
    "total": 123,
    "limit": 50,
    "offset": 0
  }
}

- Example curl

```bash
curl -H "Authorization: Bearer $CRM_TOKEN" \
  "https://api.crm.example.com/v1/users?fields=userId,phone&limit=100"
```

Notes:
- If the CRM uses different field names (e.g. `id` instead of `userId`), map accordingly in your backend adapter.

---

### 2) GET /users/{userId}/service-cards
Get the "service card" for a given user which lists their currently valid services.

- Method: GET
- Path: `/users/{userId}/service-cards` (alternatively `/users/{userId}/services`)
- Path params:
  - `userId` (string) — CRM user identifier
- Query params:
  - `includeExpired` (optional, boolean) — default `false` (only currently valid)
- Response 200:
{
  "userId": "string",
  "services": [
    {
      "serviceId": "string",
      "name": "All Access Membership",
      "status": "active", // active | expired | pending
      "validFrom": "2025-02-01T00:00:00Z",
      "validTo": "2026-01-31T23:59:59Z",
      "metadata": {
        "gymId": "gym_123",
        "posItemId": "pos_456"
      }
    }
  ]
}

- Example curl

```bash
curl -H "Authorization: Bearer $CRM_TOKEN" \
  "https://api.crm.example.com/v1/users/abc123/service-cards"
```

Notes:
- The backend should filter `status: active` or check `validFrom`/`validTo` if CRM doesn't provide `status`.

---

### 3) GET /gyms
List gyms known to the CRM.

- Method: GET
- Path: `/gyms`
- Query params: `limit`, `offset`, `search` (by name or location)
- Response 200:
{
  "data": [
    {
      "gymId": "gym_123",
      "name": "Downtown Climbing",
      "address": {
        "line1": "123 Main St",
        "city": "City",
        "state": "ST",
        "postalCode": "12345",
        "country": "US"
      },
      "timeZone": "America/Los_Angeles",
      "posLocationId": "pos_loc_789"
    }
  ],
  "meta": { "total": 10, "limit": 50, "offset": 0 }
}

- Example curl

```bash
curl -H "Authorization: Bearer $CRM_TOKEN" \
  "https://api.crm.example.com/v1/gyms"
```

---

### 4) GET /gyms/{gymId}/services
Get services offered at a gym (e.g., memberships, day passes, classes).

- Method: GET
- Path: `/gyms/{gymId}/services`
- Path params: `gymId`
- Query params: `limit`, `offset`
- Response 200:
{
  "gymId": "gym_123",
  "services": [
    {
      "serviceId": "svc_001",
      "name": "Monthly Membership",
      "description": "Unlimited access",
      "price": 6000, // cents
      "currency": "USD",
      "active": true
    }
  ]
}

- Example curl

```bash
curl -H "Authorization: Bearer $CRM_TOKEN" \
  "https://api.crm.example.com/v1/gyms/gym_123/services"
```

Notes:
- Price integer is cents to avoid floating point issues.

---

### 5) GET /gyms/{gymId}/pos-items
Get POS items for a gym (retail items, passes, gift cards, class products).

- Method: GET
- Path: `/gyms/{gymId}/pos-items`
- Path params: `gymId`
- Query params: `limit`, `offset`, `category`
- Response 200:
{
  "gymId": "gym_123",
  "items": [
    {
      "posItemId": "pos_456",
      "name": "Day Pass",
      "sku": "DAYPASS-1",
      "price": 1500,
      "currency": "USD",
      "taxable": true,
      "available": true
    }
  ]
}

- Example curl

```bash
curl -H "Authorization: Bearer $CRM_TOKEN" \
  "https://api.crm.example.com/v1/gyms/gym_123/pos-items"
```

---

## Rate limiting & caching recommendations
- Respect `Retry-After` header on 429 responses.
- Cache stable lists (gyms, gym services) for short periods (e.g., 5–15 minutes) unless real-time updates are required.

## Implementation notes for backend
- Implement an adapter that maps CRM fieldnames to your internal model (`userId`, `phone`, `serviceId`, `gymId`, `posItemId`).
- Normalize phone numbers to E.164 on ingest.
- When requesting a user's service card, prefer server-side filtering to only return currently valid services. If CRM doesn't provide this, filter by `validFrom`/`validTo` in backend.
- Add retry with exponential backoff for transient 5xx errors.

## Next steps / TODOs
- Confirm actual CRM field names and example responses; update mapping.
- Add auth token rotation instructions if the CRM token expires.
- Add OpenAPI schema if needed for automated client generation.

---

End of spec.
