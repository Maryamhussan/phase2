---
name: auth-skill
description: Implement secure authentication systems including signup, signin, password hashing, JWT-based auth, and Better Auth integration.
---

# Authentication Skill

## Instructions

1. **User Signup**
   - Validate input (email, password, username)
   - Hash passwords before storing
   - Prevent duplicate accounts

2. **User Signin**
   - Verify credentials securely
   - Compare hashed passwords
   - Issue authentication tokens on success

3. **Password Security**
   - Use strong hashing algorithms (bcrypt, argon2)
   - Never store plain-text passwords
   - Apply proper salt rounds

4. **JWT Authentication**
   - Generate access tokens on login
   - Set expiration time
   - Protect private routes using token verification

5. **Better Auth Integration**
   - Configure Better Auth provider
   - Use built-in session and token handling
   - Integrate with frontend and backend seamlessly

## Best Practices
- Always hash passwords
- Use environment variables for secrets
- Keep JWT expiry short
- Implement refresh tokens if needed
- Return generic auth errors (avoid leaking info)
- Follow OWASP authentication guidelines

## Example Structure
```ts
// signup
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "strongPassword123"
}

// signin
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
