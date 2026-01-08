# Agent Onboarding API Documentation

This document details the 6-step flow for upgrading a user to an **Agent**.

## Base URL
`http://localhost:3000/api/v1`

## Response Format
All successful responses are wrapped in a standard `data` envelope:
```json
{
  "statusCode": 200, // or 201
  "message": "Success message (optional)",
  "data": { ... } // Actual response content
}
```

## Authorization
All endpoints require a valid Bearer Token.
- **Header**: `Authorization: Bearer <access_token>`

---

## Onboarding Steps

### Step 1: Personal Info
Updates the user's basic personal details.

- **Endpoint**: `/users/onboarding/step-1`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "firstName": "Moyosoluwa",
    "lastName": "Alabi",
    "phoneNumber": "+2348012345678"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "statusCode": 200,
    "data": {
      "firstName": "Moyosoluwa",
      "lastName": "Alabi",
      "phoneNumber": "+2348012345678",
      "isProfileComplete": true
      // ...other fields
    }
  }
  ```

### Step 2: Agent Type
Sets the type of agent/owner.

- **Endpoint**: `/users/onboarding/step-2`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "type": "Individual Property Owner"
    // Enum: "Individual Property Owner", "Real Estate Agent", "Property Manager / Company"
  }
  ```

### Step 3: Operating Area
Sets the location where the agent operates.

- **Endpoint**: `/users/onboarding/step-3`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "city": "Lagos",
    "neighborhood": "Lekki Phase 1"
  }
  ```

### Step 4: Payout Details
Sets the bank account for receiving payments.

- **Endpoint**: `/users/onboarding/step-4`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "bankName": "Access Bank",
    "accountNumber": "1920039394",
    "accountName": "SHOMWE AGENT TEST ACCOUNT"
  }
  ```

### Step 5: Identity Document (Upload)
Uploads the government-issued ID.

- **Endpoint**: `/users/onboarding/step-5`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: (File) The image or PDF of the ID.
  - `docType`: (String) "NIN", "Driver's License", or "International Passport".
- **Response** (201 Created):
  ```json
  {
    "statusCode": 201,
    "data": {
      "agentProfile": {
        "identityDocumentUrl": "https://res.cloudinary.com/...",
        "identityDocumentType": "NIN",
        "verificationStatus": "pending"
      }
    }
  }
  ```

### Step 6: Selfie Verification & Finalize
Uploads a selfie and **finalizes the upgrade**. The user's role changes to `agent`.

- **Endpoint**: `/users/onboarding/step-6`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: (File) The selfie image.
- **Response** (201 Created):
  ```json
  {
    "statusCode": 201,
    "data": {
      "role": "agent",
      "agentProfile": {
        "selfieUrl": "https://res.cloudinary.com/...",
        "verificationStatus": "pending"
      }
    }
  }
  ```
