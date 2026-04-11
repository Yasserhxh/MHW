import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { authApi } from '../api/auth.api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const email = watch('email');

  const onSubmit = async (data: FormData) => {
    // Always resolves successfully to avoid user enumeration
    await authApi.forgotPassword(data.email).catch(() => undefined);
  };

  if (isSubmitSuccessful) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Check your email</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            If an account exists for <strong>{email}</strong>, we sent a reset link. Check your inbox.
          </p>
        </div>
        <Link to="/login">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Forgot your password?</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your email and we'll send you a reset link.
        </p>
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

        <Button type="submit" loading={isSubmitting} className="w-full">
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
