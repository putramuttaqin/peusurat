import { render } from 'preact';
import { AuthProvider } from './shared/AuthContext';
import AppLayout from './shared/AppLayout'; // new
import './styles/base.css';

render(
  <AuthProvider>
    <AppLayout />
  </AuthProvider>,
  document.getElementById('app')
);
