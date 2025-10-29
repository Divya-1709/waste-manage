# Admin Dashboard Functionality Implementation Plan

## Steps to Complete:

1. [x] Create backend/models/Vehicle.js - Schema for vehicles (name, type, licensePlate, capacity).

2. [x] Create backend/models/Pickup.js - Schema for pickups (userId, address, scheduledDate, status, assignedVehicle).

3. [x] Create backend/controllers/vehicleController.js - CRUD functions: addVehicle (POST), getVehicles (GET), updateVehicle (PUT), deleteVehicle (DELETE).

4. [x] Create backend/controllers/pickupController.js - Functions: getPickups (GET), assignPickup (PUT), updatePickupStatus (PUT).

5. [x] Create backend/controllers/userController.js - Functions: getUsers (GET), updateUser (PUT), deleteUser (DELETE).

6. [x] Create backend/routes/adminRoutes.js - Routes for /vehicles (CRUD), /pickups (GET/assign/update), /users (GET/update/delete), protected by authMiddleware.

7. [ ] Edit backend/server.js - Import and mount adminRoutes under /api/admin.

8. [ ] Edit src/pages/AdminDashboard.jsx - Add sections/tabs for Manage Users (list with edit/delete), Add Vehicles (form), Assign Pickups (list with dropdown to assign vehicle, update status). Use fetch for API calls.

## Followup:
- Restart servers after changes.
- Test CRUD operations.
- Verify in MongoDB Compass.
