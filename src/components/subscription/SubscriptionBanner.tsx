
import { CreditCard, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

export const SubscriptionBanner = () => {
  const { subscription, tournamentCount, remainingTournaments, canCreateTournament, upgradeToPremium } = useSubscription();

  if (subscription?.subscription_type === 'premium') {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">Premium Account</h3>
                <p className="text-sm text-amber-700">
                  {tournamentCount} of {subscription.tournaments_limit} tournaments used
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canCreateTournament) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Tournament Limit Reached</h3>
                <p className="text-sm text-red-700">
                  You've used all {tournamentCount} free tournaments. Upgrade to create more!
                </p>
              </div>
            </div>
            <PremiumUpgradeModal>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </PremiumUpgradeModal>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Free Account</h3>
              <p className="text-sm text-blue-700">
                {remainingTournaments} tournaments remaining. Upgrade for unlimited access!
              </p>
            </div>
          </div>
          <PremiumUpgradeModal>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Premium ($29/month)
            </Button>
          </PremiumUpgradeModal>
        </div>
      </CardContent>
    </Card>
  );
};
