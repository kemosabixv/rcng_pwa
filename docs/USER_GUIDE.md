# RCNG API User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Making Your First Request](#making-your-first-request)
4. [Common Operations](#common-operations)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

## Getting Started

### Prerequisites
- A valid user account in the RCNG system
- API access credentials (if using API keys)
- Basic knowledge of REST APIs and HTTP methods

### Base URL
All API requests should be made to your instance's base URL:

```
https://api.rcng.example.com/api
```

For local development:
```
http://localhost:8000/api
```

## Authentication

### Obtaining an Access Token

1. Send a POST request to the login endpoint:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "your.email@example.com",
  "password": "your_password"
}
```

2. On successful authentication, you'll receive a response containing an access token:

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Using the Access Token
Include the access token in the `Authorization` header of subsequent requests:

```
Authorization: Bearer your_access_token_here
```

## Making Your First Request

### Example: Get Current User

```http
GET /user
Authorization: Bearer your_access_token_here
Accept: application/json
```

### Example: Create a New Document

```http
POST /documents
Authorization: Bearer your_access_token_here
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="title"

Meeting Minutes - August 2023
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="description"

Monthly board meeting minutes
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="minutes-aug-2023.pdf"
Content-Type: application/pdf

<file content here>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## Common Operations

### Pagination

List endpoints return paginated results. Use the following query parameters:

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15, max: 100)

Example:
```
GET /documents?page=2&per_page=20
```

### Filtering

Filter results using query parameters:

```
GET /users?status=active&role=admin
```

### Sorting

Sort results using `sort` and `order` parameters:

```
GET /documents?sort=created_at&order=desc
```

### Including Relationships

Include related resources using the `include` parameter:

```
GET /committees/1?include=members,projects
```

## Error Handling

### Common HTTP Status Codes

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

### Error Response Format

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Best Practices

### Rate Limiting
- The API enforces rate limiting (60 requests per minute for authenticated users)
- Include appropriate delays between requests in your application
- Implement exponential backoff for handling rate limit errors

### Error Handling
- Always check the HTTP status code
- Handle network errors gracefully
- Implement retry logic for transient failures
- Log errors appropriately

### Security
- Never expose your API tokens in client-side code
- Use HTTPS for all API requests
- Rotate API tokens regularly
- Follow the principle of least privilege when assigning permissions

### Performance
- Use pagination for large datasets
- Only request the fields you need
- Cache responses when appropriate
- Implement client-side request deduplication

## Troubleshooting

### Common Issues

#### 401 Unauthorized
- Check that your access token is valid and not expired
- Ensure the token is included in the `Authorization` header with the `Bearer ` prefix
- Verify that your user account is active

#### 403 Forbidden
- Check that your user has the necessary permissions
- Verify that you're trying to access a resource you own (if applicable)
- Contact your administrator if you believe you should have access

#### 404 Not Found
- Verify the endpoint URL is correct
- Check that the resource ID exists
- Ensure you have permission to access the resource

#### 422 Unprocessable Entity
- Review the error messages for validation failures
- Ensure all required fields are provided
- Check that field formats (email, date, etc.) are correct

#### 429 Too Many Requests
- You've exceeded the rate limit
- Implement exponential backoff in your client
- Reduce the frequency of your requests

### Debugging Tips

1. **Check the Response Headers**
   - Look for `X-RateLimit-*` headers to monitor rate limits
   - Check `X-Request-ID` for server-side request tracing

2. **Enable Debug Mode** (for development only)
   ```http
   X-Debug-Mode: true
   ```

3. **Check Server Logs**
   - Contact your system administrator for access to server logs
   - Include relevant request IDs in support tickets

## Support

### Getting Help

For assistance with the API:

1. **Documentation**
   - Review the [API Reference](API_OVERVIEW.md)
   - Check the [FAQ](#) section (coming soon)

2. **Support Channels**
   - Email: support@rcng.example.com
   - Support Portal: [https://support.rcng.example.com](https://support.rcng.example.com)
   - Community Forum: [https://community.rcng.example.com](https://community.rcng.example.com)

3. **Reporting Issues**
   When reporting issues, please include:
   - The exact endpoint you're trying to access
   - The full request (with sensitive data redacted)
   - The complete response (including headers)
   - Steps to reproduce the issue
   - Any error messages

### API Status

Check the API status at [https://status.rcng.example.com](https://status.rcng.example.com) for:
- Current system status
- Scheduled maintenance
- Incident reports
- Performance metrics

## Changelog

### v1.0.0 (2023-08-16)
- Initial release of the RCNG API
- Complete documentation and examples
- Postman collection for testing

## License

This API is proprietary software. All rights reserved.
