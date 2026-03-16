import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: 'student' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(loginData.email, loginData.password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register(registerData.name, registerData.email, registerData.password, registerData.role);
      toast.success('Account created successfully!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-warm-bg">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-semibold text-gray-900 tracking-tight">Smart Complaint Portal</h1>
            <p className="mt-2 text-gray-600">Report and track campus issues efficiently</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="login-email-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="login-password-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-hover text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  disabled={isLoading}
                  data-testid="login-submit-button"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    data-testid="register-name-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="register-email-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    data-testid="register-password-input"
                    className="rounded-md border-gray-200 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role">Role</Label>
                  <select
                    id="register-role"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gold focus:ring-gold/20 focus:outline-none transition-all duration-200"
                    data-testid="register-role-select"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-hover text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  disabled={isLoading}
                  data-testid="register-submit-button"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Demo: Use any email for testing</span>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1687530449872-5393d814f8de?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/90 to-sidebar/70" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white space-y-4 max-w-lg">
            <h2 className="font-heading text-4xl font-semibold">Streamline Campus Maintenance</h2>
            <p className="text-lg text-gray-200">AI-powered complaint analysis and priority detection for faster resolution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
