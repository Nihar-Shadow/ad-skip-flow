import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { auth } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear cache and validate session on component mount
  useEffect(() => {
    console.log('🧹 DEBUG: Login page mounted - clearing any stale session data');
    
    // Check if user is already authenticated
    if (auth.isAuthenticated()) {
      console.log('🔍 DEBUG: User already authenticated, redirecting to dashboard');
      const userRole = auth.getUserRole();
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'developer') {
        navigate('/developer');
      }
      return;
    }
    
    // Clear any stale session data when visiting login page
    auth.clearAllCache();
    
    // Force a small delay to ensure cache is cleared
    const timer = setTimeout(() => {
      console.log('✅ DEBUG: Cache cleared, ready for fresh login');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log('📝 DEBUG: Form submitted with:', { username, password: password ? '***' : 'empty' });

    try {
      // Clear any existing cache before attempting login
      auth.clearAllCache();
      
      const user = await auth.login(username, password);
      
      console.log('📝 DEBUG: Auth result:', user);
      
      if (user) {
        // Force a small delay to ensure session is properly stored
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "developer") {
          navigate("/developer", { replace: true });
        }
      } else {
        setError("Invalid username or password");
        // Clear any partial session data on failed login
        auth.clearAllCache();
      }
    } catch (err) {
      console.error('📝 DEBUG: Login error:', err);
      setError("An error occurred during login");
      // Clear any partial session data on error
      auth.clearAllCache();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Admin Portal Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the admin or developer dashboard
          </p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p> </p>
          
        </div>
      </div>
    </div>
  );
}