
import { useState } from 'react';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationFormData {
  team_name: string;
  institution: string;
  speaker_1: string;
  speaker_2: string;
  contact_email: string;
  additional_info?: string;
}

interface TournamentRegistrationPortalProps {
  tournamentId: string;
  tournamentName: string;
  isOpen?: boolean;
}

export const TournamentRegistrationPortal = ({ 
  tournamentId, 
  tournamentName, 
  isOpen = true 
}: TournamentRegistrationPortalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationFormData>();

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, you'd handle team registration requests
      // For now, we'll directly add the team
      const { error } = await supabase
        .from('teams')
        .insert({
          tournament_id: tournamentId,
          name: data.team_name,
          institution: data.institution,
          speaker_1: data.speaker_1,
          speaker_2: data.speaker_2
        });

      if (error) {
        console.error('Error registering team:', error);
        toast.error('Failed to register team');
        return;
      }

      toast.success('Team registered successfully!');
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error registering team:', error);
      toast.error('Failed to register team');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Registration Closed</h3>
          <p className="text-gray-500 mt-2">Team registration is currently closed for this tournament.</p>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-700">Registration Successful!</h3>
          <p className="text-gray-600 mt-2">
            Your team has been registered for {tournamentName}. 
            You'll receive updates about the tournament schedule.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline" 
            className="mt-4"
          >
            Register Another Team
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Team Registration - {tournamentName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team_name">Team Name *</Label>
              <Input
                id="team_name"
                {...register("team_name", { required: "Team name is required" })}
                placeholder="e.g., Oxford A"
              />
              {errors.team_name && (
                <p className="text-sm text-red-600 mt-1">{errors.team_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                {...register("institution", { required: "Institution is required" })}
                placeholder="e.g., Oxford University"
              />
              {errors.institution && (
                <p className="text-sm text-red-600 mt-1">{errors.institution.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speaker_1">First Speaker *</Label>
              <Input
                id="speaker_1"
                {...register("speaker_1", { required: "First speaker name is required" })}
                placeholder="Full name"
              />
              {errors.speaker_1 && (
                <p className="text-sm text-red-600 mt-1">{errors.speaker_1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="speaker_2">Second Speaker *</Label>
              <Input
                id="speaker_2"
                {...register("speaker_2", { required: "Second speaker name is required" })}
                placeholder="Full name"
              />
              {errors.speaker_2 && (
                <p className="text-sm text-red-600 mt-1">{errors.speaker_2.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register("contact_email", { 
                required: "Contact email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="team.captain@university.edu"
            />
            {errors.contact_email && (
              <p className="text-sm text-red-600 mt-1">{errors.contact_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="additional_info">Additional Information</Label>
            <Textarea
              id="additional_info"
              {...register("additional_info")}
              placeholder="Any special requirements, dietary restrictions, etc."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Registering Team...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Register Team
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p>* Required fields</p>
          <p>Registration is subject to tournament organizer approval.</p>
        </div>
      </CardContent>
    </Card>
  );
};
