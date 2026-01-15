---
name: frontend-skill
description: Build frontend pages and components with clean layouts, modern styling, and seamless data connection to the backend.
---

# Frontend Skill

## Instructions

1. **Page Building**
   - Create reusable pages
   - Use routing effectively
   - Structure pages by feature
   - Handle loading and error states

2. **Component Design**
   - Build reusable UI components
   - Separate presentational and logic components
   - Use props and state correctly
   - Follow component-driven development

3. **Layout & Styling**
   - Design responsive layouts
   - Use modern CSS (Flexbox, Grid)
   - Apply consistent spacing and typography
   - Support dark and light modes if needed

4. **Backend / DB Connection**
   - Fetch data from backend APIs
   - Handle async data (loading, success, error)
   - Use environment variables for API URLs
   - Securely handle tokens or session data

## Best Practices
- Keep components small and focused
- Reuse layouts and UI primitives
- Follow mobile-first design
- Maintain consistent design system
- Optimize performance (lazy loading)
- Handle empty and edge states gracefully

## Example Structure
```tsx
// page component
export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <main>
      <h1>Users</h1>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </main>
  );
}
