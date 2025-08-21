import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAdmin, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && isAdmin) {
      setLocation('/admin');
    } else if (user) {
      setLocation('/');
    }
  }, [user, isAdmin, setLocation]);
  
  const [loginType, setLoginType] = useState<'guest' | 'admin'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginResult = await login(email, password);
      toast({
        title: "Login Successful",
        description: `Welcome ${loginResult?.role === 'admin' ? 'Admin' : 'Guest'}!`,
      });
      
      // Force redirect based on user role
      setTimeout(() => {
        if (loginResult?.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/');
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: "Registration Successful",
        description: `Welcome ${data.user.name}! You can now browse and purchase products.`,
      });
      
      // Redirect to home page
      setTimeout(() => {
        setLocation('/');
      }, 100);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-testid="page-login">
      <Card className="w-full max-w-md" data-testid="card-login">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 logo-gradient rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">PALANIAPPA JEWELLERS</h1>
              <p className="text-xs text-gray-500">Since 2025</p>
            </div>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <p className="text-gray-600">Choose your account type</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              {/* Login Type Selector */}
              <div className="mb-6">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      loginType === 'guest' 
                        ? 'bg-white shadow-sm text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                    onClick={() => setLoginType('guest')}
                    data-testid="button-guest-login"
                  >
                    Guest User
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      loginType === 'admin' 
                        ? 'bg-white shadow-sm text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                    onClick={() => setLoginType('admin')}
                    data-testid="button-admin-login"
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Admin Credentials Hint */}
              {loginType === 'admin' && (
                <Alert className="mb-4" data-testid="alert-admin-credentials">
                  <AlertDescription>
                    <p className="text-sm">
                      <strong>Admin Credentials:</strong><br />
                      Email: jewelerypalaniappa@gmail.com<br />
                      Password: P@lani@ppA@321
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4" data-testid="form-login">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading ? 'Signing in...' : 'Login'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation('/')}
                    data-testid="button-cancel-login"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-4" data-testid="form-register">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    required
                    data-testid="input-register-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-email">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    required
                    data-testid="input-register-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    required
                    data-testid="input-register-password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    required
                    data-testid="input-register-confirm-password"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-black border-2 border-black hover:bg-gray-100"
                    disabled={isRegistering}
                    data-testid="button-submit-register"
                  >
                    {isRegistering ? 'Creating Account...' : 'Register'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation('/')}
                    data-testid="button-cancel-register"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
