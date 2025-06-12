import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';

export function BallotSuccessPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Ballot Submitted Successfully</CardTitle>
          <CardDescription className="text-center">
            Thank you for submitting your ballot. Your feedback has been recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            The tab team will review your ballot and confirm the results.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}