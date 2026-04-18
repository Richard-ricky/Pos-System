import { useState } from 'react';
import { Wallet, Lock, Mail, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { signUp } from '../../utils/api';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, name, 'cashier');
        setSuccess('Account created! Please sign in.');
        setMode('login');
        setPassword('');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${mode === 'login' ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      
      <Card className="w-full max-w-md bg-black border-gray-800 shadow-2xl shadow-purple-500/10 relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center mb-2">
            <div className="size-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Wallet className="size-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              FinTech Wallet
            </CardTitle>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-950/50 border-red-800/50 backdrop-blur-sm">
                <AlertCircle className="size-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-950/50 border-green-800/50 backdrop-blur-sm">
                <AlertCircle className="size-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <Lock className="size-4 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4 mr-2" />
                      Create Account
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-800 text-gray-300 hover:bg-gray-950 hover:text-white"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
          >
            {mode === 'login' ? (
              <>
                <UserPlus className="size-4 mr-2" />
                Create New Account
              </>
            ) : (
              <>
                <Lock className="size-4 mr-2" />
                Already have an account? Sign In
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}