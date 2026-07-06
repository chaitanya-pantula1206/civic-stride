import { useState, useEffect, createContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/Dashboard';
import InfrastructureReport from './pages/InfrastructureReport';
import TransitMatrixReport from './pages/TransitMatrixReport';
import ClimateComfortReport from './pages/ClimateComfortReport';

// Clean Navigation Context for path routing without package complexity
export const NavigationContext = createContext<{
  path: string;
  navigate: (to: string) => void;
}>({
  path: '/',
  navigate: () => {},
});

export default function App() {
  const [path, setPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  const renderActivePage = () => {
    switch (path) {
      case '/':
        return <LandingPage />;
      case '/dashboard':
        return <Dashboard />;
      case '/analytics/infrastructure':
        return <InfrastructureReport />;
      case '/analytics/transit':
        return <TransitMatrixReport />;
      case '/analytics/climate':
        return <ClimateComfortReport />;
      default:
        // Graceful fallback to editorial landing frame
        return <LandingPage />;
    }
  };

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NavigationContext.Provider value={{ path, navigate }}>
          {renderActivePage()}
        </NavigationContext.Provider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
