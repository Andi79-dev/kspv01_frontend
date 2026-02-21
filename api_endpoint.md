# API Endpoints

This document lists all connected backend APIs used by the frontend application.

## Base URL

```
http://localhost:4021/api
```

## Authentication

### Login

- **Endpoint:** `POST /users/login`
- **Payload:** `{ username: string, password: string }`
- **Response:** `{ data: { id, username, nama, roleId, ... } }`

---

## Users API

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| GET    | `/users`      | Get all users (paginated) |
| GET    | `/users/{id}` | Get user by ID            |
| POST   | `/users`      | Create new user           |
| PUT    | `/users/{id}` | Update user               |
| DELETE | `/users/{id}` | Delete user               |

**Query Parameters for GET /users:**

- `page` (number): Page number
- `size` (number): Items per page

---

## Roles API

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/roles`      | Get all roles   |
| GET    | `/roles/{id}` | Get role by ID  |
| POST   | `/roles`      | Create new role |
| PUT    | `/roles/{id}` | Update role     |
| DELETE | `/roles/{id}` | Delete role     |

---

## Menus API

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/menus`      | Get all menus   |
| GET    | `/menus/{id}` | Get menu by ID  |
| POST   | `/menus`      | Create new menu |
| PUT    | `/menus/{id}` | Update menu     |
| DELETE | `/menus/{id}` | Delete menu     |

**Menu Input Schema:**

```typescript
{
  nama_menu: string;
  icon?: string;
  url?: string | null;
  order?: number;
  parentId?: number | null;
}
```

---

## Permissions API

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| GET    | `/permissions`               | Get all permissions (paginated) |
| GET    | `/permissions/role/{roleId}` | Get permissions by role ID      |
| POST   | `/permissions`               | Create new permission           |
| PUT    | `/permissions/{id}`          | Update permission               |
| DELETE | `/permissions/{id}`          | Delete permission               |
| PUT    | `/permissions/role/{roleId}` | Update permissions for a role   |

**Query Parameters for GET /permissions:**

- `page` (number): Page number
- `size` (number): Items per page

**Permission Input Schema:**

```typescript
{
  roleId: number;
  menuId: number;
  can_view: boolean;
  can_edit: boolean;
  can_approve: boolean;
}
```

**Bulk Update Payload:**

```typescript
{
  permissions: Partial < Permission > [];
}
```

---

## Environment Variables

| Variable              | Description          | Default                     |
| --------------------- | -------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4021/api` |

---

## Response Format

All API responses follow this structure:

```typescript
{
  data: T;
  paging?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Error Handling

The API client includes:

- **Request Interceptor:** Adds `Authorization: Bearer {token}` header to authenticated requests
- **Response Interceptor:** Handles 401 Unauthorized errors by clearing tokens and redirecting to login
