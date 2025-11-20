# Search My Drivers - Admin Panel

Admin panel for Driver Finder application built with React, Vite, and Tailwind CSS.

## Features

- ✅ Admin Login
- ✅ Dashboard with statistics
- ✅ Driver Management
  - View all drivers
  - Filter by verification status (Pending, Verified, Rejected)
  - View driver details with documents
  - Verify/Reject drivers
- ✅ Trip Management
  - View all trips
  - Trip details

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Layout/      # Layout components (Sidebar, Layout)
├── config/          # Configuration files
│   └── api.js       # Axios instance
├── pages/           # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Drivers.jsx
│   ├── DriverDetails.jsx
│   └── Trips.jsx
├── services/        # API services
│   ├── authService.js
│   ├── driverService.js
│   └── tripService.js
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## API Endpoints Used

### Authentication
- `POST /api/admins/login` - Admin login

### Drivers
- `GET /api/admins/drivers` - Get all drivers
- `GET /api/admins/drivers/:driverId` - Get driver by ID
- `PUT /api/admins/drivers/:driverId/verify` - Verify driver
- `PUT /api/admins/drivers/:driverId/reject` - Reject driver

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:tripId` - Get trip by ID

## Features

### Dashboard
- Total drivers count
- Pending verification count
- Verified drivers count
- Rejected drivers count
- Total trips count

### Driver Management
- View all drivers in a table
- Filter by verification status
- View detailed driver information
- View verification documents (Aadhar, PAN, License)
- Verify or reject drivers

### Trip Management
- View all trips
- Trip status tracking
- Trip details

## Authentication

The admin panel uses JWT token-based authentication. The token is stored in `localStorage` and automatically included in API requests.

## License

Private - Driver Finder Project
