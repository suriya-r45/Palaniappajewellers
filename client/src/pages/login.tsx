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
import { Smartphone, KeyRound, ArrowLeft } from 'lucide-react';

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
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot password state
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'phone' | 'otp' | 'reset'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

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
          phone: registerForm.phone,
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

  // Forgot password handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpLoading(true);

    try {
      console.log('Sending OTP for phone:', phoneNumber); // Debug log
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      const data = await response.json();
      toast({
        title: "OTP Sent",
        description: "We've sent a 6-digit OTP to your phone number via SMS.",
      });
      setForgotPasswordStep('otp');
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }

      const data = await response.json();
      
      // If user chooses to login directly with OTP
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Login Successful",
          description: "You are now logged in via OTP!",
        });
        
        setTimeout(() => {
          if (data.user.role === 'admin') {
            setLocation('/admin');
          } else {
            setLocation('/');
          }
        }, 100);
      } else {
        // Proceed to password reset
        setForgotPasswordStep('reset');
        toast({
          title: "OTP Verified",
          description: "Now you can set a new password.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check your OTP and try again.",
        variant: "destructive",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsOtpLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          otp: otpCode, 
          newPassword: newPassword 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password.",
      });
      
      // Reset forgot password form and go back to login
      setForgotPasswordStep('phone');
      setPhoneNumber('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOtpLoading(false);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="forgot-password">
                <Smartphone className="w-4 h-4 mr-1" />
                Forgot Password
              </TabsTrigger>
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
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="Enter your phone number (e.g., +919597201554)"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                    required
                    data-testid="input-register-phone"
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

            {/* Forgot Password Tab */}
            <TabsContent value="forgot-password" className="space-y-4">
              {forgotPasswordStep === 'phone' && (
                <>
                  <div className="text-center mb-4">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Reset Password</h3>
                    <p className="text-gray-600 text-sm">Enter your phone number to receive an OTP via WhatsApp</p>
                  </div>
                  
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number (e.g., +919442131883)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.trim())}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Make sure this is the same number you used to register
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      disabled={isOtpLoading}
                    >
                      {isOtpLoading ? 'Sending OTP...' : 'Send OTP via SMS'}
                    </Button>
                  </form>
                </>
              )}

              {forgotPasswordStep === 'otp' && (
                <>
                  <div className="text-center mb-4">
                    <KeyRound className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Enter OTP</h3>
                    <p className="text-gray-600 text-sm">
                      We've sent a 6-digit OTP to your phone number via SMS<br />
                      <strong>{phoneNumber}</strong>
                    </p>
                  </div>
                  
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <Label htmlFor="otp">6-Digit OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Check your text messages for the OTP
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        disabled={isOtpLoading || otpCode.length !== 6}
                      >
                        {isOtpLoading ? 'Verifying...' : 'Login with OTP'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setForgotPasswordStep('phone')}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Or set a new password instead:</p>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setForgotPasswordStep('reset')}
                        className="text-sm"
                        disabled={otpCode.length !== 6}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {forgotPasswordStep === 'reset' && (
                <>
                  <div className="text-center mb-4">
                    <KeyRound className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Set New Password</h3>
                    <p className="text-gray-600 text-sm">Create a new password for your account</p>
                  </div>
                  
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <Input
                        id="confirm-new-password"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isOtpLoading || newPassword !== confirmNewPassword || newPassword.length < 6}
                      >
                        {isOtpLoading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setForgotPasswordStep('otp')}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
