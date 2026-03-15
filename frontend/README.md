# Ghana Transport Frontend

This folder contains the frontend for our academic competition project. It is the user-facing part of the Ghana Transport Network system and was built to make route analysis easy to understand, interactive, and visually engaging.

The application helps a user explore towns in the transport network, compare route options, inspect the road graph, and simulate changes such as adding, updating, or removing roads.

## Project Purpose

The frontend was designed to support the main goal of the project: showing how algorithmic route planning can be presented in a practical and intuitive way.

Instead of only returning raw results from the backend, this interface allows a user to:

- choose a start town and destination
- compare shortest, fastest, and top alternative routes
- inspect the full road network visually
- see route layers directly on the graph
- test how road changes affect the network in real time

This makes the system more suitable for demonstration, academic presentation, and competition judging.

## Main Features

- Automatic route search once the origin and destination are selected
- Separate route views for shortest distance, fastest time, and top 3 recommendations
- Interactive network graph for exploring towns and road connections
- Node and edge detail panels for quick inspection
- Road editor for adding, updating, and removing roads
- Live synchronization with the backend API
- Onboarding modal for first-time users

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- react-force-graph-2d
- react-hot-toast

## How It Connects To The Backend

This frontend communicates with the Spring Boot backend through the API base URL below:

```text
http://localhost:8081/api
```

The frontend expects the backend to be running before route, graph, and editing features can work correctly.

## Running The Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Important Setup Note

Make sure the backend server is already running on port `8081` before starting the frontend. If the backend is unavailable, route results, graph data, and road editing requests will not load.

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run start
```

Starts the production build.

```bash
npm run lint
```

Runs ESLint checks on the frontend code.

## Folder Overview

```text
frontend/
├── app/                # App Router pages, layout, and global styles
├── components/         # Reusable UI components
├── lib/                # API communication helpers
├── public/             # Static assets
├── package.json        # Scripts and dependencies
└── README.md           # Frontend documentation
```

## Key Interface Areas

### 1. Route Exploration

Users select two towns from the header, and the app automatically retrieves available route options. The route view presents the result clearly so that differences in distance, time, and estimated cost can be compared quickly.

### 2. Network Visualisation

The network tab presents the transport graph as an interactive visual model. Users can zoom, pan, search for towns, inspect connections, and show or hide route layers.

### 3. Road Editing

The editor tab allows roads to be added, updated, or removed through the UI. This makes the project more than a static demonstration because it supports experimentation and immediate feedback.

## Why This Frontend Matters

For this competition, the frontend is important because it translates the backend algorithms into something judges and users can understand immediately. The project is not only about computing routes correctly, but also about presenting the results in a clear and useful way.

This interface was therefore built to balance three things:

- correctness of information
- ease of interaction
- clarity of presentation

## Authors' Note

This frontend was developed as part of an academic competition project. The focus was to create a natural, practical interface for demonstrating transport-network algorithms rather than just displaying technical outputs.
