# Portfolio - Daksh Digashia (Roll No: D25CS124)

Working Vite + React Single-Page Application with Routing, State Management, and REST API Integration.

## Practical 1: Introduction to React & Component Architecture
- Set up React environment using Vite
- Created modular, reusable functional components (`Header`, `About`, `Skills`, `Projects`, `Footer`)
- Passed data cleanly down component tree using React `props`

## Practical 2: State Management and Routing in React
- Installed and configured **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `Link`/`NavLink`)
- Configured client-side multi-page routing without full browser page reloads:
  - `/` → Home Page
  - `/projects` → Projects Page
  - `/contact` → Interactive Contact Form Page
  - `*` → Custom 404 Not Found Page
- Implemented reactive state management using **`useState`**:
  - Controlled Contact Form input
  - Live Character Count
  - UI Visibility Toggle (`showHelp`)
  - Dark / Light Theme Toggle (`isDarkMode`)

## Practical 3: API Integration and Data Rendering in React
- Consumed public REST API (`https://api.github.com/users/Daksh-124/repos`)
- Used **`useEffect`** to trigger asynchronous data fetch on component mount
- Handled 3 distinct asynchronous states cleanly:
  - **`loading`**: Displays `<Spinner />` animation component
  - **`error`**: Displays `<ErrorMessage message={error} onRetry={fetchRepositories} />` with interactive Retry button
  - **`success`**: Renders dynamic repository cards (name, stars ⭐, language, description, and GitHub URL)
- Added dynamic search filter input to filter repositories by name in real time
- Added interactive error testing toggle to simulate network/API errors live for evaluation

## Getting Started
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
