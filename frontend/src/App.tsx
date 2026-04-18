import { CameraFeed } from "./components/CameraFeed";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./hooks/useTheme";
import "./App.css";

function App() {
  const { theme, toggle } = useTheme();

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ThemeToggle theme={theme} onToggle={toggle} />
      <div id="main-content">
        <CameraFeed />
      </div>
    </div>
  );
}

export default App;
