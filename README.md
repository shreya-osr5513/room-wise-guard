# Smart Habitat

Build a polished, production-style, mobile-responsive web application for an AI-Assisted IoT Smart Building Monitoring and Energy Management System.

The frontend will initially use mock/dummy data, but it must be architected so that later it can connect to a real backend/API receiving live data from ESP32 devices simulated in Wokwi.

Design: Use a professional dark navy, teal and white color palette. The interface should feel like a premium modern IoT/building-management product rather than a student project. Use clean spacing, rounded cards, subtle shadows, clear typography, meaningful icons and excellent contrast. It must work perfectly on mobile, tablet and desktop.

Create a simple Login page for Admin / Facility Manager. Authentication can be mocked for now but the structure should be ready for real authentication later.

After login, include navigation for Overview, Rooms, Alerts, Energy, Activity and Settings. On desktop use a sidebar; on mobile use a responsive drawer or bottom navigation.

The Overview Dashboard should show Total Rooms, Occupied Rooms, Empty Rooms, Energy Alerts, Average Temperature, devices online/offline, and overall building status.

Show multiple rooms using mock data. Each room must display Room Number, Occupancy Status, Temperature, Humidity, Fan ON/OFF, Light ON/OFF, Environmental/Comfort Status, Device Online/Offline status and Last Updated time.

Make every room card clickable. Create a detailed Room View showing current room conditions, occupancy, appliance status, temperature, humidity, environmental status, automation mode and recent activity.

If a room is empty while appliances remain ON, show an intelligent energy-wastage alert such as:
“No occupancy detected in Room 102 for 10 minutes. Fan and Light are still ON.”
Provide Turn All Off and Ignore actions.

Add three operating modes for each room: Automatic, Approval and Manual.
Automatic mode will eventually allow the system to automatically control appliances.
Approval mode should request user confirmation before switching appliances OFF.
Manual mode should allow direct user control.

Include manual Fan and Light ON/OFF controls in the room detail page. For now they should update mock application state, but later these actions will send commands through an API to an ESP32.

Add an Alerts page showing energy wastage, high temperature, device offline and environmental alerts with status such as Active, Resolved or Ignored.

Add an Activity Log showing actions such as “Occupancy detected”, “Fan turned OFF”, “Alert approved”, and “Device reconnected”.

Add an Energy page with simple mock analytics such as appliance runtime, energy-wastage events and estimated energy saved. Keep charts clean and minimal.

Add a Settings page where each room can select Automatic / Approval / Manual mode and configure an empty-room delay such as 5, 10 or 15 minutes.

Include room search and filters such as All, Occupied, Empty, Alerts and Offline.

Add a small AI Recommendation area for future ML integration, for example: “Room likely to remain empty — recommend switching appliances OFF.” Use mock recommendations only for now.

Keep all mock data in a separate data/service layer rather than hardcoding values throughout UI components. Create a clean API/service abstraction so that later mock data can easily be replaced by real backend endpoints without redesigning the frontend.

Use React + TypeScript + Tailwind CSS and create reusable components. Keep the code clean, organized and integration-ready. Do not add a real backend yet and do not overcomplicate the application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3f6e2282-10e3-4f01-9371-2c8798d200be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
