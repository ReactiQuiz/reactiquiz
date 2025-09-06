import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function Secret() { return <div>Secret Page</div>; }
function Login() { return <div>Login Page</div>; }

describe('ProtectedRoute', () => {
  it('redirects to login if not authenticated', () => {
    const ui = (
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/secret" element={<ProtectedRoute isAuthenticated={false}><Secret /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    render(ui);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows content when authenticated', () => {
    const ui = (
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={<ProtectedRoute isAuthenticated={true}><Secret /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    render(ui);
    expect(screen.getByText('Secret Page')).toBeInTheDocument();
  });
});




