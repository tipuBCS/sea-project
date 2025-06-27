# Kanban Task Management System

A modern task management application built with React and FastAPI, featuring a drag-and-drop Kanban board interface for efficient task organization and tracking.
Application Link: d39kticnloydq6.cloudfront.net

## Features

### Task Management
- Create, edit, and delete tasks
- Drag and drop tasks between different status columns
- Set task properties:
  - Name and description
  - Priority levels
  - Time estimates (min/max hours)
  - Due dates
  - Assignees
  - Completion status

### User System
- Secure authentication and authorization
- Role-based access control (Admin and User roles)
- Personal task boards

### Interface
- Intuitive drag-and-drop interface
- Responsive design
- Dark/Light mode support
- Real-time updates
- Task sorting
- Progress tracking

## Technology Stack

### Frontend
- React
- AWS Cloudscape Design System
- TypeScript
- React DND Kit (Drag and Drop)
- React Router
- React Toastify

### Backend
- Python
- FastAPI
- PynamoDB (DynamoDB ORM)
- pytest for testing

### Database
- Amazon DynamoDB

# Usage
Application Link: d39kticnloydq6.cloudfront.net

## Creating a Task

1. Click the "+" button in any column
2. Fill in task details:
   - Task name
   - Description
   - Priority level
   - Time estimates
   - Due date (optional)
   - Assignee (optional)
3. Click "Create Task"

## Managing Tasks

   - Drag and drop tasks between columns
   - Click on a task to edit its details
   - Mark tasks as complete
   - Delete tasks using the task menu

## User Roles

   - Admin: Full access to all boards and tasks
   - User: Access to own board and assigned tasks

# Deployment Guide
## Deploying the UI
1. Create a build file with 'pnpm run build' inside ui
2. Upload build file to the S3 bucket hosting the website
3. Delete the cache 

# Using Guide:
1. Get website url:
   - Go to Cloudfront
   - Go to the Correct distribution (connected to the S3 bucket)
   - Read Distribution domain name e.g. (d39kticnloydq6.cloudfront.net)
   - Ender the domain name to login

# Local Deployment Guide

1. Run `cd ui`
2. Run `pnpm start`
