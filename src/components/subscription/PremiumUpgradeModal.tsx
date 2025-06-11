
import { useState } from 'react';
import { Crown, Check, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumUpgradeModalProps {
  children: React.ReactNode;
}

export const PremiumUpgradeModal = ({ children }: PremiumUpgradeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { upgradeToPremium } = useSubscription();

  const handleUpgrade = async () => {
    await upgradeToPremium();
    setIsOpen(false);
  };

  const features = {
    free: [
      '3 tournaments maximum',
      'Basic team management',
      'Standard draws generation',
      'Community support'
    ],
    premium: [
      'Unlimited tournaments',
      'Advanced British Parliamentary draws',
      'Institution clash avoidance',
      'Judge allocation optimization',
      'Real-time results updates',
      'CSV bulk import/export',
      'Public shareable links',
      'Advanced analytics dashboard',
      'Priority support',
      'Custom branding options'
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Unlock advanced features for professional tournament management
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Free Plan</CardTitle>
              <p className="text-2xl font-bold">$0<span className="text-sm font-normal">/month</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 relative">
            <div className="absolute -top-2 -right-2">
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Best Value
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Plan
              </CardTitle>
              <p className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>✅ 30-day money-back guarantee</p>
          <p>✅ Cancel anytime</p>
          <p>✅ Instant access to all premium features</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
