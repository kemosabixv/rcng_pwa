# RCNG API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [Filtering & Sorting](#filtering--sorting)
8. [File Uploads](#file-uploads)
9. [Testing](#testing)
10. [Support](#support)

## Introduction

Welcome to the RCNG API documentation. This API provides programmatic access to the RCNG system, allowing you to manage users, committees, projects, documents, and more.

### Base URL
All API endpoints are relative to the base URL:
```
https://api.rcng.example.com/api
```

For local development:
```
http://localhost:8000/api
```

### Response Format
All API responses are in JSON format and include a consistent structure:

#### Success Response
```json
{
  "data": {},
  "meta": {}
}
```

#### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer your_jwt_token_here
```

### Default Admin Account

After installation, a default admin account is created with the following credentials:
- **Email:** admin@rcng.local
- **Password:** Randomly generated (shown during installation)

**Important:** Change the default password immediately after first login.

### Role-Based Access Control

The system implements role-based access control with the following roles:
- **admin:** Full system access
- **chair:** Committee management access
- **member:** Regular user access
- **guest:** Read-only access

### Obtaining a Token

1. **Login**
   ```http
   POST /api/login
   ```
   Request body:
   ```json
   {
     "email": "admin@rcng.local",
     "password": "your_password_here"
   }
   ```

2. **Successful Response**
   ```json
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
     "token_type": "bearer",
     "expires_in": 3600,
     "user": {
       "id": 1,
       "name": "System Administrator",
       "email": "admin@rcng.local",
       "role": "admin",
       "status": "active"
     }
   }
   ```

3. **Error Response**
   ```json
   {
     "message": "Unauthorized",
     "error": "Invalid credentials"
   }
   ```

### Protecting Routes

Most API endpoints are protected and require a valid JWT token. The token must be included in the `Authorization` header of each request.

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Invalidate token
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Committees
- `GET /committees` - List committees
- `POST /committees` - Create committee
- `GET /committees/{id}` - Get committee details
- `PUT /committees/{id}` - Update committee
- `DELETE /committees/{id}` - Delete committee

### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Documents
- `GET /documents` - List documents
- `POST /documents` - Upload document
- `GET /documents/{id}` - Get document details
- `GET /documents/{id}/download` - Download document
- `GET /documents/{id}/preview` - Preview document
- `PUT /documents/{id}` - Update document
- `DELETE /documents/{id}` - Delete document

### Quotations
- `GET /quotations` - List quotations
- `POST /quotations` - Create quotation
- `GET /quotations/{id}` - Get quotation details
- `PUT /quotations/{id}` - Update quotation
- `DELETE /quotations/{id}` - Delete quotation
- `POST /quotations/{id}/approve` - Approve quotation
- `POST /quotations/{id}/reject` - Reject quotation

### Dues
- `GET /dues` - List dues
- `POST /dues` - Create due
- `GET /dues/{id}` - Get due details
- `PUT /dues/{id}` - Update due
- `DELETE /dues/{id}` - Delete due
- `POST /dues/{id}/pay` - Record payment
- `GET /dues/summary` - Get dues summary

## Error Handling

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Example
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Rate Limiting

The API is rate limited to prevent abuse. The default limits are:

- 60 requests per minute for authenticated users
- 30 requests per minute for unauthenticated requests

### Headers
Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1617235200
```

## Pagination

List endpoints return paginated results. The response includes metadata about the pagination:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 75
  },
  "links": {
    "first": "http://api.rcng.example.com/api/resource?page=1",
    "last": "http://api.rcng.example.com/api/resource?page=5",
    "prev": null,
    "next": "http://api.rcng.example.com/api/resource?page=2"
  }
}
```

### Query Parameters
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15, max: 100)

## Filtering & Sorting

Many list endpoints support filtering and sorting:

### Filtering
Use query parameters to filter results:

```
GET /users?status=active&role=member
```

### Sorting
Use the `sort` and `order` parameters:

```
GET /users?sort=name&order=desc
```

## File Uploads

File uploads are supported via `multipart/form-data`. The maximum file size is 10MB by default.

### Example Request
```http
POST /documents HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Authorization: Bearer your_jwt_token_here

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/pdf

<file content here>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## Testing

### Postman Collection
Import the Postman collection from `docs/postman/RCNG_API_Collection.postman_collection.json` for testing the API.

### Environment Setup
1. Set the following environment variables in Postman:
   - `base_url`: Your API base URL (e.g., `http://localhost:8000`)
   - `auth_token`: Will be set automatically after login

### Running Tests
1. Start the Laravel development server:
   ```bash
   php artisan serve
   ```

2. Run the test suite:
   ```bash
   php artisan test
   ```

## Support

For support, please contact the development team:
- Email: support@rcng.example.com
- Issue Tracker: [GitHub Issues](https://github.com/your-org/rcng/issues)

## License

This API is proprietary software. All rights reserved.
