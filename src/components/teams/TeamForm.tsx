
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Users } from "lucide-react";
import { OperationFeedback } from "@/components/feedback/OperationFeedback";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TeamFormData {
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
}

interface TeamFormProps {
  onSave: (data: TeamFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Form component for adding new teams to tournaments
 * Includes validation, loading states, and success/error feedback
 */
export const TeamForm = ({ onSave, isLoading = false }: TeamFormProps) => {
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>();

  const onSubmit = async (data: TeamFormData) => {
    console.log('Creating new team:', data);
    setOperationStatus('loading');
    
    try {
      await onSave(data);
      setOperationStatus('success');
      reset();
      
      // Reset status after showing success
      setTimeout(() => setOperationStatus('idle'), 3000);
    } catch (error) {
      setOperationStatus('error');
      // Reset status after showing error
      setTimeout(() => setOperationStatus('idle'), 4000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Add New Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Operation feedback */}
          <OperationFeedback
            status={operationStatus}
            successMessage="Team added successfully! ✨"
            errorMessage="Failed to add team. Please try again."
            loadingMessage="Adding team to tournament..."
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

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Team Members</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="speaker1_name">Speaker 1 *</Label>
                <Input
                  id="speaker1_name"
                  {...register("speaker1_name", { required: "Speaker 1 name is required" })}
                  placeholder="First speaker name"
                  disabled={isLoading}
                />
                {errors.speaker1_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.speaker1_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="speaker2_name">Speaker 2 *</Label>
                <Input
                  id="speaker2_name"
                  {...register("speaker2_name", { required: "Speaker 2 name is required" })}
                  placeholder="Second speaker name"
                  disabled={isLoading}
                />
                {errors.speaker2_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.speaker2_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="speaker3_name">Speaker 3</Label>
                <Input
                  id="speaker3_name"
                  {...register("speaker3_name")}
                  placeholder="Third speaker name (optional)"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="speaker4_name">Speaker 4</Label>
                <Input
                  id="speaker4_name"
                  {...register("speaker4_name")}
                  placeholder="Fourth speaker name (optional)"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || operationStatus === 'loading'}
            className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90"
          >
            {isLoading || operationStatus === 'loading' ? (
              <LoadingSpinner size="sm" text="Adding Team..." />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Team
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
