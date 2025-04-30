
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorDot } from "lucide-react";
import TwoFactorVerification from "@/components/auth/TwoFactorVerification";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setPasswordError("");
    setIsLoading(true);
    const success = await signup(email, password);
    setIsLoading(false);
    
    if (success) {
      // Instead of navigating directly, show 2FA verification
      setShowTwoFactor(true);
    }
  };

  const handleTwoFactorSuccess = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-byteshop-blue to-byteshop-purple/70 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <MonitorDot className="h-6 w-6 text-byteshop-purple" />
            <span className="font-bold text-xl">ByteShop</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        
        {showTwoFactor ? (
          <TwoFactorVerification email={email} onSuccess={handleTwoFactorSuccess} />
        ) : (
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-byteshop-purple hover:bg-byteshop-purple/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-byteshop-purple"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Signup;
