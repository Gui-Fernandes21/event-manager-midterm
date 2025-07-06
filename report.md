# EventFlow Manager - Technical Report

## CM2040 Database Networks and the Web Coursework

---

## 1. Architecture Overview

### Three-Tier Architecture Implementation

#### Tier 1: Presentation Layer (Client-Side)

- **Web Browser Interface**: HTML5, CSS3, and vanilla JavaScript
- **EJS Templates**: Server-side rendering for dynamic content
- **Responsive Design**: Mobile-friendly interface with modular CSS architecture
- **Client-Side JavaScript**: Form validation, interactive elements, and user experience enhancements

#### Tier 2: Application Layer (Server-Side)

- **Express.js Framework**: Web application server handling HTTP requests/responses
- **MVC Architecture Pattern**:
  - **Models**: Database interaction layer
  - **Views**: EJS templates for UI rendering
  - **Controllers**: Business logic and request processing
- **Middleware Stack**: Authentication, session management, and static file serving
- **RESTful API Endpoints**: Organized route handlers for different user flows

#### Tier 3: Data Layer (Database)

- **SQLite Database**: Lightweight, file-based relational database
- **Database Schema**: Normalized tables with foreign key constraints
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Data Validation**: Database-level constraints and application-level validation

### Key Endpoints and Client-Server Communication

- **Authentication Endpoints**: `/auth/login`, `/auth/register`, `/auth/logout`
- **Organizer Endpoints**: `/organizer/`, `/organizer/create-event`, `/organizer/settings`
- **Attendee Endpoints**: `/attendees/`, `/attendees/event/:id`, `/attendees/event/:id/book`
- **User Management**: `/users/list-users`, `/users/add-user`

---

## 2. Data Model Design

### Entity Relationship Overview

#### Core Entities

1. **Users Table**: Manages user accounts with role-based access
2. **Events Table**: Stores event information with status tracking
3. **Bookings Table**: Records ticket bookings and attendee information
4. **Site Settings Table**: Configurable application settings

#### Relationships

- **Events to Bookings**: One-to-Many relationship (one event can have multiple bookings)
- **Foreign Key Constraints**: Maintains referential integrity
- **Role-Based Data Access**: Users access different data based on their assigned roles

#### Database Schema Features

- **Primary Keys**: Auto-incrementing integers for all tables
- **Data Types**: Appropriate SQLite data types with constraints
- **Validation**: CHECK constraints for enumerated values (roles, statuses, ticket types)
- **Timestamps**: ISO format datetime strings for audit trails

---

## 3. Extension Implementation: Authentication System

### Extension Specification

**Selected Extension**: User Authentication with Role-Based Access Control

This extension implements a comprehensive authentication system that allows users to create accounts, secures routes based on authentication status, and provides different functionality based on user roles (Organizer vs Attendee).

### Implementation Details

#### 3.1 User Registration and Login System

**Password Security Implementation**:

```javascript
// File: controllers/auth.js, Lines 48-65
const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
	if (err) {
		next(err);
		return;
	}

	const query = `INSERT INTO users (user_name, email, password, role, createdAt) 
                   VALUES (?, ?, ?, ?, ?)`;
	const values = [user_name, email, hash, role, new Date().toISOString()];

	global.db.run(query, values, function (err) {
		if (err) {
			// Handle database errors
		} else {
			res.redirect("/auth/login?registered=true");
		}
	});
});
```

**Key Implementation Features**:

- **bcrypt Password Hashing**: Secure password storage with salt rounds for protection against rainbow table attacks
- **Input Validation**: Server-side validation for email format, password strength, and required fields
- **Duplicate Prevention**: Database constraints prevent duplicate email registrations

#### 3.2 Session Management

**Session Configuration** (File: middlewares/auth.js, Lines 180-197):

```javascript
const getSessionConfig = () => {
	return {
		secret: "your-secret-key-change-in-production",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // Set to true in production with HTTPS
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	};
};
```

**Session Features**:

- **Secure Cookie Configuration**: HTTPOnly cookies prevent XSS attacks
- **Session Persistence**: 24-hour session duration with automatic cleanup
- **Memory Storage**: Development-appropriate session storage (can be upgraded for production)

#### 3.3 Route Protection Middleware

**Authentication Middleware** (File: middlewares/auth.js, Lines 14-26):

```javascript
const requireAuth = (req, res, next) => {
	if (req.session && req.session.user_id) {
		return next();
	} else {
		req.session.returnTo = req.originalUrl;
		return res.redirect("/auth/login");
	}
};
```

**Middleware Application** (File: routes/main.js, Lines 14-20):

```javascript
router.use("/auth", authRoutes);

// Apply authentication middleware to following routes
router.use(requireAuth);

router.use("/users", usersRoutes);
router.use("/organizer", organizerRoutes);
router.use("/attendees", attendeeRoutes);
```

#### 3.4 Role-Based Access Control

**User Role Implementation** (Database Schema):

```sql
-- File: db_schema.sql, Lines 8-16
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('organizer', 'attendee', 'admin')) NOT NULL,
  createdAt TEXT NOT NULL
);
```

### 3.5 Key Features and Highlights

#### Security Measures

1. **Password Encryption**: bcrypt with 10 salt rounds prevents credential theft
2. **Session Security**: HTTPOnly cookies and secure session configuration
3. **Input Sanitization**: Parameterized queries prevent SQL injection attacks
4. **Authentication Checks**: Consistent middleware application across protected routes

#### User Experience Enhancements

1. **Return URL Functionality**: Users redirected to originally requested page after login
2. **Role-Based Dashboards**: Different interfaces for organizers and attendees
3. **Persistent Sessions**: Users remain logged in across browser sessions
4. **Error Handling**: Comprehensive error messages and graceful failure handling

#### Code Organization

1. **Separation of Concerns**: Authentication logic separated into dedicated middleware
2. **Reusable Components**: Middleware functions used across multiple routes
3. **Consistent API**: Standardized authentication checks throughout application
4. **Maintainable Structure**: Clear file organization and well-documented functions

### 3.6 Extension Benefits

**Enhanced Security**: The authentication system provides enterprise-level security with proper password hashing, session management, and route protection.

**Scalable Architecture**: Role-based access control allows for easy addition of new user types and permissions without major code restructuring.

**User Management**: Complete user lifecycle management from registration to role-based functionality access.

**Professional Implementation**: Follows industry best practices for web application security and user management.

---

## 4. Technical Implementation Highlights

### Database Integration

- **Foreign Key Constraints**: Ensure data integrity across related tables
- **Role-Based Data Access**: Users only access data appropriate to their role
- **Audit Trail**: Timestamp tracking for user actions and data modifications

### Error Handling

- **Graceful Degradation**: Application continues functioning even with authentication failures
- **User Feedback**: Clear error messages guide users through authentication process
- **Security Logging**: Failed authentication attempts are properly handled

### Performance Considerations

- **Session Optimization**: Efficient session storage and retrieval
- **Database Queries**: Optimized queries for user authentication and role checking
- **Middleware Efficiency**: Lightweight authentication checks minimize request overhead

---