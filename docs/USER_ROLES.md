# User Roles and Permissions

This document outlines the different user roles in the RCNG system and their respective permissions.

## Default Admin Account

During the initial installation, a default admin account is automatically created with the following credentials:
- **Email:** admin@rcng.local
- **Password:** A random 12-character password (displayed during installation)

**Important Security Note:** The admin password is only shown once during installation. Make sure to save it in a secure place and change it immediately after first login.

## User Roles

### 1. Administrator (admin)
**Description:** Full system access with all permissions.

**Permissions:**
- Create, view, edit, and delete all users
- Manage all committees and their members
- Access and modify all projects and documents
- View and manage all financial records
- System configuration and settings
- Access to all reports and analytics

### 2. Committee Chair (chair)
**Description:** Manages specific committees and their activities.

**Permissions:**
- Manage committee members and meetings
- Create and manage projects under their committee
- Upload and manage committee documents
- View financial records for their committee
- Generate reports for their committee

### 3. Committee Member (member)
**Description:** Regular committee member with basic access.

**Permissions:**
- View committee information and documents
- Participate in committee projects
- Submit reports and updates
- View their own financial records
- Update personal profile

### 4. Guest (guest)
**Description:** Limited access for external stakeholders.

**Permissions:**
- View public documents
- Access general information
- No modification rights

## User Statuses

- **Active:** User can log in and access the system
- **Inactive:** User cannot log in but their data is preserved
- **Suspended:** Temporary restriction from the system
- **Pending:** Awaiting approval (if registration requires approval)

## Security Best Practices

1. Always use strong, unique passwords
2. Change default admin password immediately after first login
3. Assign the minimum required role to each user
4. Regularly review and update user permissions
5. Deactivate unused accounts
6. Enable two-factor authentication if available

## Managing User Roles

User roles can be managed by administrators through the admin panel or by directly updating the user's role in the database.

## Role Hierarchy

```
Admin
  ↳ Committee Chair
    ↳ Committee Member
      ↳ Guest
```

## API Access

API endpoints are protected by role-based middleware. Ensure that:
- Sensitive endpoints require admin authentication
- Committee-specific endpoints validate user's committee membership
- Users can only access their own data unless they have elevated permissions

## Troubleshooting

If you encounter permission issues:
1. Verify the user's role and status
2. Check committee memberships for chair/member roles
3. Ensure the user has the necessary permissions for the requested action
4. Check for any IP restrictions or access controls

For additional assistance, please contact the system administrator.
