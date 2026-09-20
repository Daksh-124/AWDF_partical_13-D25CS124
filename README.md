# Portfolio - Daksh Digashia (Roll No: D25CS124)

Working Vite + React Single-Page Application with Routing, State Management, and REST API Integration.

## Practical 1: Introduction to React & Component Architecture
- Set up React environment using Vite
- Created modular, reusable functional components (`Header`, `About`, `Skills`, `Projects`, `Footer`)
- Passed data cleanly down component tree using React `props`

## Practical 2: State Management and Routing in React
- Installed and configured **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `NavLink`)
- Configured client-side multi-page routing without full browser page reloads:
  - `/` → Home Page
  - `/projects` → Projects Page
  - `/contact` → Interactive Contact Form Page
  - `*` → Custom 404 Not Found Page
- Implemented reactive state management using **`useState`**:
  - Controlled Contact Form, Live Character Counter, UI Visibility Toggle, and Dark/Light Theme Switcher.

## Practical 3: API Integration and Data Rendering in React
- Integrated public **GitHub REST API** (`https://api.github.com/users/Daksh-124/repos`)
- Used `useEffect` hook with empty dependency array `[]` to trigger network request on component mount.
- Managed 3 core asynchronous states:
  1. **Data State** (`repos`): Stores fetched repositories array dynamically.
  2. **Loading State** (`loading`): Displays animated `<Spinner />` component while request is in progress.
  3. **Error State** (`error`): Displays `<ErrorMessage />` component on request failure with a **Retry Button**.
- Added real-time **Search / Filter Input** to filter repositories by name or description.
- Added GitHub **Star Count** badges (`⭐`) alongside repository names.
- Added an interactive **"Test Error State"** toggle button for easy lab demonstration.

## Getting Started
```bash
npm install
npm run dev
```
