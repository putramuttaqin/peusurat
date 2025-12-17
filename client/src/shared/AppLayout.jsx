import { useContext, useEffect, useState } from 'preact/hooks';
import { Router } from 'preact-router';
import { AuthContext } from './AuthContext';
import HomePage from '../pages/HomePage';
import EntriesPage from '../pages/EntriesPage';
import Navbar from './Navbar';
import LoginModal from './LoginModal';

export default function AppLayout() {
  const { isAdmin, loading } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAdmin) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [loading, isAdmin]);

  const handleOpenModal = () => setShowLoginModal(true);
  const handleCloseModal = () => setShowLoginModal(false);

  return (
    <>
      <Navbar onLoginClick={handleOpenModal} />

      {!loading && (
        <Router>
          {/* Home is always accessible */}
          <HomePage path="/" setLoginModalVisible={handleOpenModal} />

          {/* Admin-only routes */}
          {isAdmin && <EntriesPage path="/entries" />}
        </Router>
      )}

      {showLoginModal && <LoginModal onClose={handleCloseModal} />}
    </>
  );
}
