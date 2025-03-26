
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { User, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: 'Sign Up Successful',
          description: 'Please check your email to confirm your account.',
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? 'Sign Up Error' : 'Login Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2">Email</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2">Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <Button type="submit" className="w-full">
            {isSignUp ? (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Log In
              </>
            )}
          </Button>
        </form>
        
        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-sm text-muted-foreground hover:underline"
          >
            {isSignUp 
              ? 'Already have an account? Log In' 
              : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
