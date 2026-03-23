import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        navigate('/');
      }
    } catch (error) {
      setIsError(true);

      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setMessage('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          setMessage('Please verify your email before logging in');
        } else {
          setMessage(error.message);
        }
      } else {
        setMessage('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, message, isError };
};
