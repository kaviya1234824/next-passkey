# passkey-plus-nextjs-example

This is a Next.js application demonstrating how to integrate passkey-based authentication using the AuthAction Passkey+ SDK and custom API routes.

## Overview

This project covers:

- **Passkey registration** flow via AuthAction Passkey-plus  
- **Passkey authentication** flow (biometric or platform authenticator)  
- **Secure transaction** handling with machine-to-machine (M2M) token caching  
- **Client SDK integration** for `register` and `authenticate` calls  
- **Storing** minimal session info in `localStorage` and displaying a simple dashboard  

## Prerequisites

1. **Node.js** v16 or newer  
2. **Next.js** project scaffolded (e.g. `npx create-next-app`)  
3. **AuthAction Passkey+** enabled tenant with:  
   - Tenant domain  
   - M2M Client ID & Secret  
   - App ID  
4. **@authaction/passkey-plus-sdk** installed  

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/passkey-plus-nextjs-example.git
   cd passkey-plus-nextjs-example
   ```
2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure your Authaction credentials**:

   configure your AuthAction OAuth2 details using environment variables in your .env file

   ```bash
   # Server-side (for API routes)
   AUTHACTION_TENANT_DOMAIN=your-tenant.authaction.com
   AUTHACTION_PASSKEY_CLIENT_ID=your-m2m-client-id
   AUTHACTION_PASSKEY_CLIENT_SECRET=your-m2m-client-secret
   AUTHACTION_APP_ID=your-app-id

   # Client-side SDK
   NEXT_PUBLIC_AUTHACTION_TENANT_DOMAIN=your-tenant.authaction.com
   NEXT_PUBLIC_AUTHACTION_APP_ID=your-app-id

   ```

## Usage

1. **Start the Development Server**

    ```bash
    npm run dev
    ```

    This will start the Next application on `http://localhost:3000`.

2. **Register a passkey:**

    Navigate to http://localhost:3000
    Enter an External ID and Display Name
    Click Register with Passkey and follow your authenticator

3. **Authenticate:**

    On the same form, click Login with Passkey
    Follow your platform authenticator to sign in

4. **View Dashboard:**

    After successful auth, you’ll be redirected to /dashboard
    Dashboard reads { username, email } from localStorage and displays it

## Code Explanation

### API Route: `/api/auth/passkey/transaction`

Handles both registration and authentication:
- **Reads** `type` from `req.query` (`register` or `authenticate`)
- **Validates** `externalId` & `displayName` in the request body
- **Fetches** an M2M token (cached to avoid redundant calls)
- **Explicit fetch** to one of:
  - `/api/v1/passkey-plus/{APP_ID}/transaction/register`
  - `/api/v1/passkey-plus/{APP_ID}/transaction/authenticate`
- **Returns**  
  ```json
  {
    "transactionId": "...",
    "id": "...",
    "verified": true|false
  }

### API Route: `/api/auth/passkey/verify`

Verifies the client's passkey response:

* Accepts `{ transactionId, nonce }`
* Forwards to AuthAction Passkey+ verify endpoint
* Returns success or error

### Component: `PasskeyAuth`

**Location:** `components/PasskeyAuth.tsx`

* Two buttons: **Register** & **Login**
* `handleRegister` / `handleAuthenticate` do:
  1. POST to `/api/auth/passkey/transaction?type=...`
  2. SDK call: `passkeyPlus.register` or `passkeyPlus.authenticate`
  3. POST to `/api/auth/passkey/verify`
  4. Trigger `onSuccess` or `onError`

### Page: `index.tsx` (Login)

* Simple form to collect `externalId` & `displayName`
* On submit, renders `PasskeyAuth`
* `onSuccess` stores `{ username, email }` in `localStorage` and redirects to `/dashboard`

### Page: `dashboard.tsx`

* Client-side only (`"use client"`)
* Reads `authUser` from `localStorage`
* Displays `username` and `email`
* Shows loading state if no data

## Common Issues

* **LocalStorage not set**: Ensure `onSuccess` writes to `localStorage` before redirect
* **M2M token errors**: Check your M2M Client ID/Secret and Tenant Domain
* **CORS or network issues**: Ensure your browser can reach your AuthAction tenant

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to:

* Open an issue to report bugs
* Submit pull requests for improvements

