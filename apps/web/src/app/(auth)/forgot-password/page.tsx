'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiPost, ApiError } from '@/lib/api/client';

interface Question {
  id: string;
  question: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'user' | 'questions'>('user');

  const loadQuestions = async () => {
    if (!username.trim()) {
      toast.error('Enter your username');
      return;
    }
    setLoading(true);
    try {
      const res = await apiGet<{ username: string; questions: Question[] }>(
        '/auth/forgot-questions',
        { params: { username: username.trim() }, auth: false },
      );
      setQuestions(res.data.questions);
      setAnswers({});
      setStep('questions');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  const resetWithAnswers = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiPost(
        '/auth/forgot-reset',
        {
          username: username.trim(),
          answers: questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] || '',
          })),
          newPassword,
        },
        { auth: false },
      );
      toast.success('Password reset successful. Please sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const resetWithKey = async () => {
    if (!username.trim() || !recoveryKey.trim()) {
      toast.error('Username and recovery key are required');
      return;
    }
    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      toast.error('Check password (min 8 chars) and confirmation');
      return;
    }
    setLoading(true);
    try {
      await apiPost(
        '/auth/forgot-recovery',
        {
          username: username.trim(),
          recoveryKey: recoveryKey.trim(),
          newPassword,
        },
        { auth: false },
      );
      toast.success('Password reset with recovery key. Please sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-2 w-fit px-0" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </Button>
          <CardTitle className="font-brand text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Verify your identity with favorite things (security questions), or use the Owner
            hidden recovery key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">
                <ShieldQuestion className="mr-1 h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="recovery">
                <KeyRound className="mr-1 h-4 w-4" />
                Recovery key
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cashier"
                  disabled={step === 'questions'}
                />
              </div>

              {step === 'user' ? (
                <Button className="w-full" onClick={() => void loadQuestions()} disabled={loading}>
                  {loading ? 'Loading…' : 'Continue'}
                </Button>
              ) : (
                <>
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label>{q.question}</Label>
                      <Input
                        value={answers[q.id] || ''}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Your answer"
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep('user');
                        setQuestions([]);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => void resetWithAnswers()}
                      disabled={loading}
                    >
                      {loading ? 'Resetting…' : 'Reset password'}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="recovery" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Owner sets a hidden recovery key under <strong>Users</strong>. Anyone with that key
                can reset any username.
              </p>
              <div className="space-y-2">
                <Label>Username to reset</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Owner recovery key</Label>
                <Input
                  type="password"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Hidden shop recovery key"
                />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => void resetWithKey()} disabled={loading}>
                {loading ? 'Resetting…' : 'Reset with recovery key'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
