
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { User, UserPlus, LogIn } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the form schema with validation
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const Auth = () => {
  const { user, signIn, signUp, isLoading } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL from location state or default to home
  const returnUrl = location.state?.returnUrl || '/';

  // Define form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate(returnUrl);
    }
  }, [user, isLoading, navigate, returnUrl]);

  const onSubmit = async (values: FormValues) => {
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(values.email, values.password);
        
        if (error) throw error;
        
        toast({
          title: 'Sign Up Successful',
          description: 'Please check your email to confirm your account. You can disable email confirmation in Supabase settings for testing.',
        });
      } else {
        const { error } = await signIn(values.email, values.password);

        if (error) throw error;
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        navigate(returnUrl);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isSignUp ? 'Sign Up Error' : 'Login Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={authLoading}>
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
        </Form>
        
        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-sm text-muted-foreground hover:underline"
            type="button"
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
