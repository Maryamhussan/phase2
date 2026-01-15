---
name: database-skill
description: Design and manage databases including schema design, table creation, and migrations for scalable applications.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Normalize data where appropriate
   - Define primary and foreign keys
   - Plan for scalability and future changes

2. **Table Creation**
   - Use clear and consistent naming
   - Choose appropriate data types
   - Apply constraints (NOT NULL, UNIQUE)
   - Add indexes for performance

3. **Database Migrations**
   - Create versioned migration files
   - Apply schema changes incrementally
   - Support rollback strategies
   - Keep migrations idempotent

4. **Data Integrity**
   - Enforce referential integrity
   - Use transactions for critical operations
   - Avoid redundant or duplicated data

## Best Practices
- Design schema before writing code
- Use migrations instead of manual changes
- Keep tables small and focused
- Index frequently queried columns
- Avoid premature optimization
- Document schema decisions

## Example Structure
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
