# RCNG API Documentation

This document provides detailed information about the RCNG API endpoints, request/response formats, and authentication mechanisms.

## Base URL

All API endpoints are prefixed with `/api`.

```
https://yourdomain.com/api
```

## Authentication

The API uses Laravel Sanctum for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer {token}
```

## Response Format

All API responses follow this format:

```json
{
    "success": true,
    "message": "Success message",
    "data": {}
}
```

## Error Handling

Error responses include an error message and status code:

```json
{
    "success": false,
    "message": "Error message",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

## Rate Limiting

- 60 requests per minute per IP address
- 1000 requests per minute for authenticated users

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /register | Register a new user |
| POST   | /login    | Authenticate user and get token |
| POST   | /forgot-password | Request password reset link |
| POST   | /reset-password | Reset password with token |
| POST   | /logout   | Invalidate authentication token |
| GET    | /user     | Get authenticated user details |
| PUT    | /profile  | Update user profile |
| POST   | /avatar   | Update user avatar |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /users   | List all users |
| POST   | /users   | Create a new user |
| GET    | /users/{id} | Get user details |
| PUT    | /users/{id} | Update user |
| DELETE | /users/{id} | Delete user |
| PUT    | /users/{id}/status | Update user status |
| GET    | /statistics/users | Get user statistics |

### Committees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /committees | List all committees |
| POST   | /committees | Create a new committee |
| GET    | /committees/{id} | Get committee details |
| PUT    | /committees/{id} | Update committee |
| DELETE | /committees/{id} | Delete committee |
| POST   | /committees/{id}/members | Add members to committee |
| DELETE | /committees/{id}/members | Remove members from committee |
| PUT    | /committees/{id}/members/{user}/role | Update member role |
| GET    | /committees/{id}/statistics | Get committee statistics |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /projects | List all projects |
| POST   | /projects | Create a new project |
| GET    | /projects/{id} | Get project details |
| PUT    | /projects/{id} | Update project |
| DELETE | /projects/{id} | Delete project |
| POST   | /projects/{id}/members | Add members to project |
| DELETE | /projects/{id}/members | Remove members from project |
| PUT    | /projects/{id}/progress | Update project progress |
| POST   | /projects/{id}/complete | Mark project as complete |
| GET    | /projects/{id}/statistics | Get project statistics |

### Dues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /dues    | List all dues |
| POST   | /dues    | Create a new due |
| GET    | /dues/{id} | Get due details |
| PUT    | /dues/{id} | Update due |
| DELETE | /dues/{id} | Delete due |
| POST   | /dues/{id}/pay | Mark due as paid |
| GET    | /users/{id}/dues/summary | Get user's due summary |
| GET    | /dues/statistics | Get due statistics |
| GET    | /dues/overdue | Get overdue dues |
| POST   | /dues/{id}/remind | Send payment reminder |
| POST   | /dues/{id}/waive | Waive a due |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /documents | List all documents |
| POST   | /documents | Upload a new document |
| GET    | /documents/{id} | Get document details |
| PUT    | /documents/{id} | Update document |
| DELETE | /documents/{id} | Delete document |
| GET    | /documents/{id}/download | Download document |
| GET    | /documents/{id}/preview | Preview document |
| POST   | /documents/{id}/replace | Replace document file |
| GET    | /statistics/documents | Get document statistics |

### Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /quotations | List all quotations |
| POST   | /quotations | Create a new quotation |
| GET    | /quotations/{id} | Get quotation details |
| PUT    | /quotations/{id} | Update quotation |
| DELETE | /quotations/{id} | Delete quotation |
| POST   | /quotations/{id}/items | Add items to quotation |
| PUT    | /quotations/{id}/items/{item} | Update quotation item |
| DELETE | /quotations/{id}/items/{item} | Remove item from quotation |
| POST   | /quotations/{id}/send | Mark quotation as sent |
| POST   | /quotations/{id}/accept | Accept quotation |
| POST   | /quotations/{id}/reject | Reject quotation |
| POST   | /quotations/{id}/duplicate | Duplicate quotation |
| GET    | /statistics/quotations | Get quotation statistics |

## Request Examples

### User Registration

```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### User Login

```http
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Create Committee

```http
POST /api/committees
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Executive Committee",
    "description": "Responsible for executive decisions",
    "chairperson_id": 1,
    "status": "active"
}
```

### Create Project

```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Community Center Renovation",
    "description": "Renovation of the local community center",
    "committee_id": 1,
    "budget": 50000,
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "status": "planned",
    "priority": "high",
    "created_by": 1
}
```

### Upload Document

```http
POST /api/documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "title": "Project Proposal",
    "description": "Initial project proposal document",
    "file": "[binary file data]",
    "type": "proposal",
    "visibility": "restricted",
    "uploaded_by": 1,
    "committee_id": 1,
    "project_id": 1
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request -- Your request is invalid |
| 401 | Unauthorized -- Your API key is wrong |
| 403 | Forbidden -- You don't have permission |
| 404 | Not Found -- The specified resource doesn't exist |
| 405 | Method Not Allowed -- You tried to access an endpoint with an invalid method |
| 422 | Unprocessable Entity -- Input validation failed |
| 429 | Too Many Requests -- Slow down! |
| 500 | Internal Server Error -- We had a problem with our server |
| 503 | Service Unavailable -- We're temporarily offline for maintenance |

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)
- `sort_by`: Field to sort by (default: created_at)
- `sort_order`: Sort order (asc/desc, default: desc)

Example:
```
GET /api/users?page=2&per_page=10&sort_by=name&sort_order=asc
```

## Filtering

Most list endpoints support filtering using query parameters. For example:

```
GET /api/users?status=active&role=admin
```

## Search

Search across fields using the `search` parameter:

```
GET /api/users?search=john
```

## Rate Limiting Headers

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1617235200
```
