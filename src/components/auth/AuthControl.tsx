import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { login, signUp, logout, onAuthChange } from '../../lib/auth';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthControl = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setError(null); // Clear any previous errors on auth state change
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      setError(null); // Clear error on successful login
    } catch (err: any) {
      console.error('Login error in AuthControl:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleSignUp = async (email, password) => {
    try {
      await signUp(email, password);
      setError(null); // Clear error on successful sign up
    } catch (err: any) {
      console.error('SignUp error in AuthControl:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error('Logout error in AuthControl:', err);
      setError(err.message || 'Failed to logout.');
    }
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}!</p>
        <button onClick={handleLogout}>Logout</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {showLogin ? (
        <>
          <LoginForm onLoginSubmit={handleLogin} />
          <p>
            Don't have an account?{' '}
            <button onClick={() => { setShowLogin(false); setError(null); }}>Sign Up</button>
          </p>
        </>
      ) : (
        <>
          <SignUpForm onSignUpSubmit={handleSignUp} />
          <p>
            Already have an account?{' '}
            <button onClick={() => { setShowLogin(true); setError(null); }}>Login</button>
          </p>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AuthControl;
