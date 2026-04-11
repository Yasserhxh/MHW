import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { authApi } from '../api/auth.api';

const schema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const email = watch('email');

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({ email: data.email, password: data.password });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError.response?.data?.detail ?? 'Registration failed. Please try again.';
      setError('root', { message: detail });
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Check your inbox</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
          We sent a verification link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="text-slate-500 text-sm mt-1">Start managing your household finances</p>
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
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          hint="Min 8 chars, one uppercase, one number"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {errors.root && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          Create account
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
