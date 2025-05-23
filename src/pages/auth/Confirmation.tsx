
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle } from "lucide-react";

const Confirmation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <BrainCircuit className="h-10 w-10 text-tabby-secondary" />
            <span className="ml-2 text-2xl font-bold font-outfit">TabbyAI</span>
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-semibold text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Please click on the link in your email to complete your registration. 
              If you don't see the email, please check your spam folder.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link to="/auth/sign-in">Return to sign in</Link>
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              Didn't receive an email?{" "}
              <Link to="/auth/sign-in" className="text-tabby-secondary hover:underline">
                Try again
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;
