import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: 'free' | 'premium';
  tournaments_limit: number;
  plan_name: string;
  amount_cents: number;
  created_at: string;
  expires_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentCount, setTournamentCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchTournamentCount();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscription({
          id: data.id,
          user_id: data.user_id,
          subscription_type: data.subscription_type as 'free' | 'premium',
          tournaments_limit: data.tournaments_limit,
          plan_name: 'Free', // Default value since it's not in database
          amount_cents: 0, // Default value since it's not in database
          created_at: data.created_at,
          expires_at: data.expires_at
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTournamentCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      if (error) {
        console.error('Error fetching tournament count:', error);
        return;
      }

      setTournamentCount(count || 0);
    } catch (error) {
      console.error('Error fetching tournament count:', error);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_type: 'premium',
          tournaments_limit: 50,
          plan_name: 'Premium Monthly',
          amount_cents: 2900, // $29.00
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Error upgrading subscription:', error);
        toast.error('Failed to upgrade subscription');
        return;
      }

      toast.success('Successfully upgraded to Premium!');
      fetchSubscription();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    }
  };

  const canCreateTournament = () => {
    if (!subscription) return tournamentCount < 3; // Default free limit
    return tournamentCount < subscription.tournaments_limit;
  };

  const getRemainingTournaments = () => {
    const limit = subscription?.tournaments_limit || 3;
    return Math.max(0, limit - tournamentCount);
  };

  const getPricingInfo = () => {
    return {
      free: {
        name: 'Free Plan',
        price: '$0/month',
        tournaments: 3,
        features: ['Basic team management', 'Standard draws', 'Community support']
      },
      premium: {
        name: 'Premium Plan',
        price: '$29/month',
        tournaments: 50,
        features: [
          'Unlimited tournaments',
          'Advanced BP draws',
          'Institution clash avoidance', 
          'Judge optimization',
          'Real-time updates',
          'CSV import/export',
          'Public links',
          'Priority support'
        ]
      }
    };
  };

  return {
    subscription,
    isLoading,
    tournamentCount,
    canCreateTournament: canCreateTournament(),
    remainingTournaments: getRemainingTournaments(),
    upgradeToPremium,
    getPricingInfo,
    refetch: () => {
      fetchSubscription();
      fetchTournamentCount();
    }
  };
};
