'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/page-transition';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { loginAction } from '@/lib/actions';

interface LoginFormState {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'member';
    createdAt: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        'Sign In'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { isDarkMode } = useUIStore();
  
  const [state, formAction] = useActionState(loginAction, {
    success: false,
    message: '',
    errors: {},
  } as LoginFormState);

  useEffect(() => {
    if (state.success && state.user) {
      setUser(state.user);
      router.push('/teams');
    }
  }, [state.success, state.user, setUser, router]);

  return (
    <PageTransition>
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold ">Team Manager</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="admin@demo.com"
                placeholder="Enter your email"
                required
                className={state.errors?.email ? 'border-red-500' : ''}
              />
              {state.errors?.email && (
                <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue="admin123"
                placeholder="Enter your password"
                required
                className={state.errors?.password ? 'border-red-500' : ''}
              />
              {state.errors?.password && (
                <p className="text-sm text-red-500 mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {state.message && !state.success && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <SubmitButton />
          </form>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Admin: admin@demo.com / admin123</p>
            <p>Member: member@demo.com / member123</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </PageTransition>
  );
}