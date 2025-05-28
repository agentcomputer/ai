import React, { useState } from 'react';

interface SignUpFormProps {
  onSignUpSubmit: (email, password) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUpSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    try {
      await onSignUpSubmit(email, password);
    } catch (err: any) {
      console.error('SignUp error in SignUpForm:', err);
      setError(err.message || 'Sign up failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="signup-email">Email:</label>
        <input
          type="email"
          id="signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-password">Password:</label>
        <input
          type="password"
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="signup-confirm-password">Confirm Password:</label>
        <input
          type="password"
          id="signup-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpForm;
