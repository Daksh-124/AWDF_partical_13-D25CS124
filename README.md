# Portfolio - Daksh Digashia (Roll No: D25CS124)

Working Vite + React Single-Page Application with Client-Side Routing and State Management.

## Practical 1: Introduction to React & Component Architecture
- Set up React environment using Vite
- Created modular, reusable functional components (`Header`, `About`, `Skills`, `Projects`, `Footer`)
- Passed data cleanly down component tree using React `props`

## Practical 2: State Management and Routing in React
- Installed and configured **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `Link`/`NavLink`)
- Configured client-side multi-page routing without full browser page reloads:
  - `/` → Home Page (Header, About, Skills)
  - `/projects` → Projects Page
  - `/contact` → Interactive Contact Form Page
  - `*` → Custom 404 Not Found Page
- Implemented reactive state management using **`useState`**:
  - **Controlled Contact Form**: Real-time two-way data binding on form input.
  - **Live Character Count**: Displays real-time message length below textarea.
  - **UI Visibility Toggle**: Button toggling instruction box visibility (`showHelp` state).
  - **Dark / Light Theme Toggle**: Dynamic state toggling `.dark-theme` / `.light-theme` root classes.

## Getting Started
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
