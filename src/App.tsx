
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import NewLandingPage from './components/NewLandingPage';
import Dashboard from './components/Dashboard';


function AppContent() {
  const { user } = useAuth();
  // Show app if user is logged in
  if (user) {
    return <Dashboard />;
  }
  // Show new interactive landing page by default
  return <NewLandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;