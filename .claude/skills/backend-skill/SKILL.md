---
name: backend-skill
description: Build backend services by generating routes, handling requests and responses, and connecting to databases.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Define RESTful endpoints
   - Organize routes by feature or resource
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Version APIs when needed

2. **Request Handling**
   - Parse request parameters and body
   - Validate and sanitize input
   - Handle authentication and authorization
   - Use middleware for shared logic

3. **Response Handling**
   - Return consistent response formats
   - Use correct HTTP status codes
   - Handle errors gracefully
   - Avoid leaking internal details

4. **Database Connection**
   - Establish secure database connections
   - Use ORM or query builders
   - Manage connection pooling
   - Perform CRUD operations efficiently

## Best Practices
- Keep routes thin, move logic to services
- Validate all incoming data
- Use async/await with proper error handling
- Follow REST or RPC conventions consistently
- Separate concerns (routes, controllers, services)
- Log errors and important events

## Example Structure
```ts
// route definition
app.get("/api/users", async (req, res) => {
  const users = await db.user.findMany();
  res.status(200).json(users);
});
