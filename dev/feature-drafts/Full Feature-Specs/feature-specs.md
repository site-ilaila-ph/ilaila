Website Specification

1. Project Information

Project Name:
ilaila

Project Type:
Website of San Pedro's upper villages's Heritage Food Digital Museum.

Purpose:
To show others San Pedro's upper villages's famous food heritage businesses,
from their origins, traditional and cultural roots.

Target Users:
General public

2. Goals

The website should:

- Be Functional
- Show Heritage Food Exhibit
- Shows Historical Documentation
- Shows History of each food
- Shows Preperation Process
- Be Cultural Significance
- Have a Photo Gallery
- Have a Recipe Section

3. Technologies / Stacks

- Frontend

* Javascript
* TypeScript
* React.JS
* [Framework/library]

- Backend

* Node.js
* Next.js

- Database

* Supabase

- PostgreSQL

* Other Tools

- Git / GitHub
- Docker
- Prisma + images

* Deployment & Production

- Vercel

4. Pages
   Home - Main landing page

   Landing - The public-facing showcase of the application for unauthenticated visitors. It provides a visually engaging overview of San Pedro's culinary landscape and local businesses, featuring strong calls-to-action encouraging visitors to sign up for a personalized experience.

   About - Information about the project

   Heritage Food Gallery - Series of heritage photos from the local businesses in San Pedro

   History of Each Food - Shows the history of each foods from it's origin to

   Preparation Process - The series of steps you take to get ready for a specific

   Cultural Significance - What is the significance of their business to San Pedro

   Reference Page - (If we stated a reference outside from our research)

   Recipe Section - The general recipe to make the

   Interview with local Vendors - (If possible)

   Video Demonstration - Shows a video for brief introduction about the business or the food

   Login - User login

   Sign-In - The secure login gateway for returning users to access their accounts. It verifies credentials and routes the user directly to the authenticated home/ dashboard upon successful login.

   Sign-Up - A secure registration portal where new users can create an account using their email address or third-party providers (e.g., Google, Facebook) to unlock community features, bookmarking, and personalized recommendations.

   Sign-Out - A session-termination endpoint that securely logs the user out, clears local authentication tokens, and seamlessly redirects them back to the unauthenticated landing/ page.

   Dashboard - Main user area

   Settings - User settings

5. Features
   - User Features
   * Can comment and leave a review to a business or food
   * Check the recipe of foods
   * Check out the businesses
   * Check is there any worth local eateries to eat in San Pedro's Upper Villages
   - Admin Features
   * Manage businesses
   * Manage the dashboard
   * Manage the foods
   * Manage the reviews
   * Manage the users

6. User Flow

- User opens the website.
- User goes to the landing page
- User goes to the Login page / Sign-Up page.
- User enters their credentials.
- System validates the credentials.
- User is redirected to the user/admin Dashboard.
- User selects a feature.
- System processes the request.
- System displays the result.

=== DO NOT READ NUMBER 7 YET ===

7. UI / Design
   Theme

[Modern / Minimal / Professional / Gaming / etc.]

Main Colors
Primary: [Color]
Secondary: [Color]
Background: [Color]
Text: [Color]
Layout
Responsive design
Mobile-friendly
Tablet-friendly
Desktop-friendly
Navigation

[Navbar / Sidebar / Bottom navigation / etc.]

8. Components

Navbar / Header
Main
Footer
Buttons
Forms
Cards
[Other components]

=== DO NOT READ NUMBER 9 YET ===

9. Database
   Tables
   Users
   Column Type Description
   id INT User ID
   name VARCHAR User's name
   email VARCHAR User email
   password VARCHAR Hashed password
   [Another Table]
   Column Type Description
   id INT ID
   [column] [type] [description]

10. Validation

Required fields
Email format
Password requirements
Duplicate accounts
Invalid input
[Other validation]

11. Error Handling

The system should display appropriate messages when:

Login fails
Registration fails
Database connection fails
Required fields are empty
Invalid data is submitted
Server/API request fails

12. Security

Password hashing
Input validation
Prepared SQL statements / Sanitized Queries
Authentication
Authorization
Protected API endpoints
Environment variables for secrets

13. Responsive Requirements
    The website should work on:

Mobile: 320px+
Tablet: 768px+
Laptop: 1024px+
Desktop: 1440px+
The layout should adapt without horizontal scrolling.
aswell as for diffrent orientations:
Portrait
Landscape

14. Requirements

Functional Requirements

User can register

User can log in

User can log out

User can [feature]

Admin can [feature]

Non-Functional Requirements

Responsive

Fast loading

Secure

Accessible

Maintainable

Cross-browser compatible

15. Deployment

Frontend:

- Vercel

Backend & Database:

- Supabase

Domain:
ilaila.vercel.app

16. Testing

Test the following:

Registration

Login

Logout

Forms

Database operations

API requests

Mobile layout

Tablet layout

Desktop layout

Error handling

17. Project Status

Planning - Completed

UI Design - Development

Frontend - Development

Backend - Development

Database - Completed

API - Completed

Testing - Planning

Deployment - Development
