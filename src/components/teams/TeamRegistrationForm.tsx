
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExperienceLevel, BreakCategory, TournamentRegistration } from '@/types/tournament';

interface TeamRegistrationFormProps {
  onSubmit: (data: TournamentRegistration) => void;
  breakCategories: BreakCategory[];
  isSubmitting?: boolean;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { 
    value: 'novice', 
    label: 'Novice', 
    description: 'New to debate or less than 1 year experience' 
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: '1-3 years of debate experience' 
  },
  { 
    value: 'open', 
    label: 'Open', 
    description: '3+ years experience or no restrictions' 
  },
  { 
    value: 'pro', 
    label: 'Professional', 
    description: 'Professional or elite level debaters' 
  },
];

export const TeamRegistrationForm: React.FC<TeamRegistrationFormProps> = ({
  onSubmit,
  breakCategories,
  isSubmitting = false
}) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TournamentRegistration>({
    defaultValues: {
      team_name: '',
      institution: '',
      speaker_1: '',
      speaker_2: '',
      experience_level: 'novice',
      break_category: ''
    }
  });

  const selectedExperienceLevel = watch('experience_level');
  
  // Filter break categories based on selected experience level
  const availableCategories = breakCategories.filter(category => 
    category.experience_levels.includes(selectedExperienceLevel)
  );

  const selectedCategory = availableCategories.find(cat => cat.id === watch('break_category'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Team Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="team_name">Team Name *</Label>
              <Input
                id="team_name"
                {...register("team_name", { required: "Team name is required" })}
                placeholder="Enter team name"
              />
              {errors.team_name && (
                <p className="text-sm text-red-600 mt-1">{errors.team_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                {...register("institution")}
                placeholder="School, University, or Organization"
              />
            </div>
          </div>

          {/* Speakers */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="speaker_1">Speaker 1 *</Label>
              <Input
                id="speaker_1"
                {...register("speaker_1", { required: "Speaker 1 is required" })}
                placeholder="First speaker name"
              />
              {errors.speaker_1 && (
                <p className="text-sm text-red-600 mt-1">{errors.speaker_1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="speaker_2">Speaker 2</Label>
              <Input
                id="speaker_2"
                {...register("speaker_2")}
                placeholder="Second speaker name (optional)"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-4">
            <div>
              <Label>Experience Level *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    onClick={() => setValue('experience_level', level.value)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedExperienceLevel === level.value
                        ? 'border-tabby-secondary bg-tabby-secondary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{level.label}</span>
                      {selectedExperienceLevel === level.value && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Break Category Selection */}
            {availableCategories.length > 0 && (
              <div>
                <Label>Break Category</Label>
                <Select 
                  value={watch('break_category')} 
                  onValueChange={(value) => setValue('break_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a break category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific category</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">{selectedCategory.name}</p>
                    <p className="text-gray-600">
                      Experience levels: {selectedCategory.experience_levels.join(', ')}
                    </p>
                    {selectedCategory.min_teams && (
                      <p className="text-gray-600">
                        Min teams: {selectedCategory.min_teams}
                        {selectedCategory.max_teams && `, Max teams: ${selectedCategory.max_teams}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
