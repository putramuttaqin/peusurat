import { useContext, useEffect, useState } from 'preact/hooks';
import { Router } from 'preact-router';
import { AuthContext } from './AuthContext';
import HomePage from '../pages/HomePage';
import FormPage from '../pages/FormPage';
import EntriesPage from '../pages/EntriesPage';
import Navbar from './Navbar';
import LoginModal from './LoginModal';

export default function AppLayout() {
  const { isAdmin, loading } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Only show modal if loading is done AND we are definitely NOT logged in
    if (loading) return; // wait for auth check to complete

    if (!isAdmin) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false); // Important: hide if already logged in
    }
  }, [loading, isAdmin]);

  const handleOpenModal = () => setShowLoginModal(true);
  const handleCloseModal = () => setShowLoginModal(false);

  return (
    <>
      <Navbar onLoginClick={handleOpenModal} />
      {!loading && (
        <Router>
          <HomePage path="/" setLoginModalVisible={handleOpenModal} />
          {isAdmin && <FormPage path="/form" />}
          {isAdmin && <EntriesPage path="/entries" />}
        </Router>
      )}
      {showLoginModal && <LoginModal onClose={handleCloseModal} />}
    </>
  );
}
