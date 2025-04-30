
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface TwoFactorVerificationProps {
  email: string;
  onSuccess: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({ email, onSuccess }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyTwoFactor, resendVerificationCode } = useAuth();

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsVerifying(true);
    const success = await verifyTwoFactor(email, verificationCode);
    setIsVerifying(false);
    
    if (success) {
      onSuccess();
    }
  };

  const handleResendCode = async () => {
    await resendVerificationCode(email);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Two-Factor Verification</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to your email
          <div className="mt-1 font-medium text-byteshop-purple">{email}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} index={index} className="border-byteshop-purple/30 focus:border-byteshop-purple" />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          className="w-full bg-byteshop-purple hover:bg-byteshop-purple/90"
          onClick={handleVerify}
          disabled={verificationCode.length !== 6 || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
        <Button
          variant="ghost"
          className="text-byteshop-purple"
          onClick={handleResendCode}
        >
          Resend Code
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorVerification;
