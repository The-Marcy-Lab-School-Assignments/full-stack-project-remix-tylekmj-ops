import { useState, useEffect } from 'react';
import { getMe, login, register, logout } from './adapters/auth-adapters';
import AuthPage from './components/AuthPage';
import ApplicationPage from './components/ApplicationPage';
import JobBoardPage from './components/JobBoardPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('tracker');

  useEffect(() => {
    const checkForSession = async () => {
      const { data: user } = await getMe();
      setCurrentUser(user);
    };
    checkForSession();
  }, []);

  const handleLogin = async (username, password) => {
    const { data: user, error } = await login(username, password);
    if (error) return error;
    setCurrentUser(user);
  };

  const handleRegister = async (username, password) => {
    const { data: user, error } = await register(username, password);
    if (error) return error;
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setCurrentPage('tracker');
  };

  return (
    <>
      <header>
        <h1>Job Application <span>Tracker</span></h1>
        {currentUser && (
          <nav>
            <button
              className={`nav-btn ${currentPage === 'tracker' ? 'active' : ''}`}
              onClick={() => setCurrentPage('tracker')}
            >
              My Applications
            </button>
            <button
              className={`nav-btn ${currentPage === 'jobs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('jobs')}
            >
              Job Board
            </button>
          </nav>
        )}
      </header>
      <main>
        {!currentUser && (
          <AuthPage handleLogin={handleLogin} handleRegister={handleRegister} />
        )}
        {currentUser && currentPage === 'tracker' && (
          <ApplicationPage currentUser={currentUser} handleLogout={handleLogout} />
        )}
        {currentUser && currentPage === 'jobs' && (
          <JobBoardPage currentUser={currentUser} />
        )}
      </main>
    </>
  );
}

export default App;