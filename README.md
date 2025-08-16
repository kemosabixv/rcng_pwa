# Rotary Club of Nairobi Gigiri (RCNG)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive management system for the Ruiru Central Neighbourhood Association, designed to streamline committee operations, member management, and document handling.

## Features

- **User Management**: Role-based access control for administrators, committee chairs, and members
- **Committee Management**: Organize and manage committees with member assignments
- **Document Management**: Secure storage and sharing of association documents
- **Project Tracking**: Monitor committee projects and tasks
- **Financial Management**: Track member dues and payments
- **Meeting Management**: Schedule and document committee meetings

## Documentation

- [Installation Guide](docs/INSTALLATION.md) - Complete setup and configuration instructions
- [API Documentation](docs/API_OVERVIEW.md) - Comprehensive API reference
- [User Roles and Permissions](docs/USER_ROLES.md) - Detailed explanation of access levels
- [Database Schema](docs/DATABASE_CONFIGURATION.md) - Database structure and relationships

## Quick Start

1. Clone the repository
2. Follow the [installation instructions](docs/INSTALLATION.md)
3. Access the application at `http://localhost:8000`
4. Log in with the default admin credentials (displayed during installation)

## Default Admin Account

A default admin account is created during installation with the following credentials:
- **Email:** admin@rcng.local
- **Password:** Randomly generated (displayed during installation)

**Important:** Change the default password immediately after first login.

## Development

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
