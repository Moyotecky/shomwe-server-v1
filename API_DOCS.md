# Shomwe API Documentation

## Authentication Flow

The authentication flow consists of three steps:
1.  **Request OTP**: User enters their email.
2.  **Verify OTP**: User enters the 6-digit code sent to their email. This returns an access token.
3.  **Complete Profile**: If the user is new (profile incomplete), they should be prompted to enter their details.

### Base URL
`http://localhost:3000/api/v1` (Default)

---

### 1. Send OTP
Request a verification code to be sent to the user's email.

- **Endpoint**: `/auth/send-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "message": "OTP sent successfully"
  }
  ```

### 2. Verify OTP
Verify the code and log the user in. Use the `accessToken` from the response for subsequent authenticated requests.

- **Endpoint**: `/auth/verify-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "659d8...",
      "email": "user@example.com",
      "firstName": "John",       // Null if new user
      "lastName": "Doe",         // Null if new user
      "role": "guest",
      "isProfileComplete": false // Use this to trigger profile completion flow if false
    }
  }
  ```
- **Error Types**:
  - `401 Unauthorized`: Invalid OTP or OTP expired.

### 3. Complete Profile
Update the user's personal details. This endpoint requires authentication.

- **Endpoint**: `/auth/profile`
- **Method**: `PUT`
- **Headers**:
  - `Authorization`: `Bearer <accessToken>`
- **Body**:
  ```json
  {
    "firstName": "Moyo",
    "lastName": "Alabi",
    "dob": "1995-05-20" // ISO 8601 Date String
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "_id": "659d8...",
    "firstName": "Moyo",
    "lastName": "Alabi",
    "email": "user@example.com",
    "isProfileComplete": true,
    // ...other user fields
  }
  ```
