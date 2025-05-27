
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus } from "lucide-react";
import { OperationFeedback } from "@/components/feedback/OperationFeedback";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RoundFormData {
  round_number: number;
  motion: string;
  info_slide: string;
  start_time: string;
}

interface RoundFormProps {
  tournamentId: string;
  onSave: (data: RoundFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Form component for adding new rounds to tournaments
 * Includes motion input, scheduling, and enhanced user feedback
 */
export const RoundForm = ({ tournamentId, onSave, isLoading = false }: RoundFormProps) => {
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoundFormData>();

  const onSubmit = async (data: RoundFormData) => {
    console.log('Creating new round:', data);
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
          <Plus className="h-5 w-5" />
          Add New Round
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Operation feedback */}
          <OperationFeedback
            status={operationStatus}
            successMessage="Round created successfully! 🎯"
            errorMessage="Failed to create round. Please try again."
            loadingMessage="Creating round..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round_number">Round Number</Label>
              <Input
                id="round_number"
                type="number"
                min="1"
                {...register("round_number", { 
                  required: "Round number is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Round number must be at least 1" }
                })}
                placeholder="1"
                disabled={isLoading}
              />
              {errors.round_number && (
                <p className="text-sm text-red-600 mt-1">{errors.round_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register("start_time")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motion">Motion</Label>
            <Textarea
              id="motion"
              {...register("motion", { required: "Motion is required" })}
              placeholder="This house believes that..."
              rows={3}
              disabled={isLoading}
            />
            {errors.motion && (
              <p className="text-sm text-red-600 mt-1">{errors.motion.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="info_slide">Info Slide (Optional)</Label>
            <Textarea
              id="info_slide"
              {...register("info_slide")}
              placeholder="Additional information for the round..."
              rows={2}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || operationStatus === 'loading'}
            className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90"
          >
            {isLoading || operationStatus === 'loading' ? (
              <LoadingSpinner size="sm" text="Adding Round..." />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Round
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
