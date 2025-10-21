# SplashPublication Feature Documentation

## Overview
The SplashPublication feature allows administrators to create and manage publications that appear as popups to users after they select their language preference on the website. Only one publication can be active at a time, and users will only see each publication once per version.

## Features

### Admin Management
- **CRUD Operations**: Create, read, update, and delete splash publications
- **Exclusive Activation**: Only one publication can be active at a time
- **Search & Pagination**: Find publications quickly with search and paginated results
- **Rich Content**: Support for title, description, and image
- **Publication Scheduling**: Set publication dates

### Public Display
- **Smart Timing**: Appears after language selection, before main site content
- **One-Time Display**: Uses localStorage to ensure users only see each publication once
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Smooth Animations**: Framer Motion animations for professional feel

## Database Schema

```sql
CREATE TABLE splash_publication (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500) NOT NULL,
  publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## API Endpoints

### Admin Endpoints (Protected)
- `GET /api/splash-publications` - List publications with pagination and search
- `POST /api/splash-publications` - Create new publication
- `PUT /api/splash-publications/:id` - Update publication
- `DELETE /api/splash-publications/:id` - Delete publication
- `PATCH /api/splash-publications/:id/toggle` - Toggle active status

### Public Endpoints
- `GET /api/splash-publications/active` - Get active publication (cached)

## Usage Instructions

### For Administrators

1. **Access the Admin Panel**
   - Navigate to `/splash-publications` (requires owner/superadmin role)
   - Available in the admin navigation menu

2. **Creating a Publication**
   - Click "Nouvelle Publication"
   - Fill in title (required), description, image URL (required)
   - Set publication date (optional)
   - Save to create

3. **Activating a Publication**
   - Click the power icon (⚡) next to any publication
   - Only one publication can be active at a time
   - Activating one automatically deactivates others

4. **Managing Publications**
   - Use search to find specific publications
   - Edit by clicking the edit icon
   - View details by clicking the eye icon
   - Delete with confirmation dialog

### For Users

1. **Viewing Publications**
   - Publications appear automatically after language selection
   - Only shown once per publication version
   - Can be dismissed with close button or Escape key
   - Clicking outside the modal also closes it

## Technical Implementation

### Components
- `SplashPublication.tsx` - Admin management page
- `SplashPublicationPopup.tsx` - Public popup component
- `SplashPublicationService.ts` - API service layer

### Key Features
- **localStorage Logic**: `splashPubSeen:v1` stores seen publication data
- **Exclusive Activation**: Backend ensures only one active publication
- **Caching**: Public endpoint uses Redis/memory cache for performance
- **Validation**: Comprehensive input validation on frontend and backend
- **Error Handling**: Toast notifications for all operations

### Security
- JWT authentication required for admin operations
- Role-based access control (owner/superadmin only)
- Input sanitization and validation
- CORS protection

## File Structure

```
backend/
├── routes/
│   └── splash-publications.js
└── controllers/
    └── splash-publications.controller.js

src/
├── components/
│   ├── SplashPublication.tsx
│   └── SplashPublicationPopup.tsx
├── lib/
│   └── splash-publication.ts
├── pages/
│   └── SplashPublication.tsx
└── types.ts
```

## Future Enhancements

- Image upload instead of URL input
- Rich text editor for descriptions
- Publication analytics (views, engagement)
- A/B testing for multiple active publications
- Scheduled publication activation/deactivation
- Push notifications for new publications