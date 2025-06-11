import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Users } from "lucide-react";
import { OperationFeedback } from "@/components/feedback/OperationFeedback";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import React from "react";
import { Team } from "@/types/tournament";

interface TeamFormData {
  name: string;
  institution: string;
  speaker_1: string;
  speaker_2: string;
}

interface TeamFormProps {
  onSave: (data: TeamFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<TeamFormData>;
  isEditMode?: boolean;
}

/**
 * Form component for adding new teams to tournaments
 * Includes validation, loading states, and success/error feedback
 */
export const TeamForm = ({ onSave, isLoading = false, defaultValues = {}, isEditMode = false }: TeamFormProps) => {
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm<TeamFormData>({
    defaultValues: defaultValues as TeamFormData
  });

  // Set default values when editing
  // (for react-hook-form v7+, this is handled by defaultValues, but we ensure it updates on prop change)
  React.useEffect(() => {
    if (isEditMode && defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof TeamFormData, value as any);
      });
    }
  }, [defaultValues, isEditMode, setValue]);

  const onSubmit = async (data: TeamFormData) => {
    setOperationStatus('loading');
    try {
      await onSave(data);
      setOperationStatus('success');
      if (!isEditMode) reset();
      setTimeout(() => setOperationStatus('idle'), 3000);
    } catch (error) {
      setOperationStatus('error');
      setTimeout(() => setOperationStatus('idle'), 4000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {isEditMode ? 'Edit Team' : 'Add New Team'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Operation feedback */}
          <OperationFeedback
            status={operationStatus}
            successMessage={isEditMode ? 'Team updated successfully! ✨' : 'Team added successfully! ✨'}
            errorMessage={isEditMode ? 'Failed to update team. Please try again.' : 'Failed to add team. Please try again.'}
            loadingMessage={isEditMode ? 'Updating team...' : 'Adding team to tournament...'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Team name is required" })}
                placeholder="Team Alpha"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                {...register("institution", { required: "Institution is required" })}
                placeholder="University Name"
                disabled={isLoading}
              />
              {errors.institution && (
                <p className="text-sm text-red-600 mt-1">{errors.institution.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speaker_1">Speaker 1 *</Label>
              <Input
                id="speaker_1"
                {...register("speaker_1", { required: "Speaker 1 is required" })}
                placeholder="First Speaker"
                disabled={isLoading}
              />
              {errors.speaker_1 && (
                <p className="text-sm text-red-600 mt-1">{errors.speaker_1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="speaker_2">Speaker 2 *</Label>
              <Input
                id="speaker_2"
                {...register("speaker_2", { required: "Speaker 2 is required" })}
                placeholder="Second Speaker"
                disabled={isLoading}
              />
              {errors.speaker_2 && (
                <p className="text-sm text-red-600 mt-1">{errors.speaker_2.message}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || operationStatus === 'loading'}
          >
            {operationStatus === 'loading' ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditMode ? 'Updating Team...' : 'Adding Team...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Team' : 'Add Team'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
