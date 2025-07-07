# CM2040 Database Networks and the Web #

## EventFlow Manager - Event Management System

### Project Overview
This is a comprehensive event management web application built with Node.js, Express, and SQLite. It features two main user flows: **Organizer** (for creating and managing events) and **Attendee** (for browsing and booking events).

### Libraries and Dependencies

#### Core Dependencies (Production)
- **express** (^4.18.2) - Web application framework for Node.js
- **ejs** (^3.1.8) - Embedded JavaScript templating engine
- **sqlite3** (^5.1.2) - SQLite database driver for Node.js
- **express-session** (^1.18.1) - Session middleware for Express
- **bcrypt** (^6.0.0) - Password hashing library for secure authentication
- **date-fns** (^4.1.0) - Modern JavaScript date utility library for formatting dates

#### Development Dependencies
- **nodemon** (^3.1.10) - Development utility that automatically restarts the server when files change

### Project Structure
```
├── controllers/           # Business logic controllers
│   ├── auth.js           # Authentication logic
│   ├── attendee.js       # Attendee functionality
│   ├── organizers.js     # Organizer functionality
│   └── user.js           # User management
├── middlewares/          # Express middlewares
│   └── auth.js           # Authentication middleware
├── routes/               # Express route definitions
│   ├── auth.js           # Authentication routes
│   ├── attendee.js       # Attendee routes
│   ├── main.js           # Main application routes
│   ├── organizers.js     # Organizer routes
│   └── users.js          # User management routes
├── views/                # EJS templates
│   ├── auth/             # Authentication pages
│   ├── attendee/         # Attendee interface
│   └── organizer/        # Organizer interface
├── public/               # Static assets (CSS, images)
│   ├── main.css          # Main stylesheet with imports
│   ├── attendee.css      # Attendee-specific styles
│   ├── organizer.css     # Organizer-specific styles
│   ├── homepage.css      # Homepage styles
│   ├── button.css        # Button component styles
│   └── settings.css      # Settings page styles
├── db_schema.sql         # Database schema definition
├── index.js              # Main application entry point
└── package.json          # Node.js dependencies and scripts
```

### Key Features Implemented
- **Authentication System**: Complete login/register with bcrypt password hashing
- **Role-Based Access**: Separate interfaces for Organizers and Attendees
- **Event Management**: CRUD operations for events with draft/published states
- **Booking System**: Ticket booking with quantity tracking (General & VIP tickets)
- **Settings Management**: Configurable site settings with database persistence
- **Responsive Design**: Mobile-friendly CSS with modular stylesheets
- **Session Management**: Secure session-based authentication
- **Real-time Updates**: Dynamic ticket availability calculations

### Database Configuration
The application uses SQLite with the following tables:
- `users` - User accounts with roles (organizer/attendee)
- `events` - Event information with ticket availability
- `bookings` - Ticket bookings with attendee details
- `site_settings` - Configurable application settings
- `email_accounts` - User email management (template feature)

### Environment Requirements
- **Node.js**: >=16.0.0
- **NPM**: >=8.0.0
- **SQLite3**: Pre-installed on most systems

### Application Configuration
- **Port**: 3000 (default)
- **Database**: SQLite (./database.db)
- **Session Storage**: In-memory (development)
- **Views Engine**: EJS
- **Static Files**: ./public directory

### Setup Instructions
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create Database**:
   ```bash
   # On Windows:
   npm run build-db-win
   
   # On Mac/Linux:
   npm run build-db
   ```

3. **Start Application**:
   ```bash
   npm start
   ```

4. **Access Application**:
   - Main page: http://localhost:3000
   - Login: http://localhost:3000/auth/login
   - Register: http://localhost:3000/auth/register

### Development Commands
- `npm run dev` - Start with nodemon for development
- `npm run clean-db` / `npm run clean-db-win` - Delete database for fresh start
- `npm run build-db` / `npm run build-db-win` - Recreate database from schema

### Security Features
- Password hashing with bcrypt (salt rounds: 10)
- Session-based authentication
- SQL injection protection through parameterized queries
- CSRF protection through session validation
- Role-based access control

### Performance Optimizations
- Modular CSS with @import statements
- Embedded JavaScript for template-specific functionality
- Efficient database queries with proper indexing
- Session management for reduced authentication overhead

### Browser Compatibility
- Modern browsers supporting ES6+
- Mobile-responsive design
- Progressive enhancement for JavaScript features

### Notes for Evaluators
- All database modifications are done through `db_schema.sql`
- No additional build steps required beyond `npm install`, `npm run build-db`, and `npm start`
- Application follows MVC architecture pattern
- Comprehensive error handling and validation implemented
- CRUD operations fully implemented for all major entities

