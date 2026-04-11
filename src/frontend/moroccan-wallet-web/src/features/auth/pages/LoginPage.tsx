import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await authApi.login(data);
      setAuth(res.accessToken, res.refreshToken, res.userId, res.email);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError.response?.data?.detail ?? 'Invalid credentials. Please try again.';
      setError('root', { message: detail });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        {errors.root && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
