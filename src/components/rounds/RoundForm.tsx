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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const roundFormSchema = z.object({
  round_number: z.number()
    .min(1, "Round number must be at least 1")
    .max(100, "Round number cannot exceed 100"),
  motion: z.string()
    .min(10, "Motion must be at least 10 characters long")
    .max(500, "Motion cannot exceed 500 characters"),
  info_slide: z.string()
    .max(1000, "Info slide cannot exceed 1000 characters")
    .optional(),
  start_time: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Start time must be in the future"
    })
});

type RoundFormData = z.infer<typeof roundFormSchema>;

interface RoundFormProps {
  tournamentId: string;
  onSave: (data: RoundFormData) => Promise<void>;
  isLoading?: boolean;
  existingRounds?: number[];
}

/**
 * Form component for adding new rounds to tournaments
 * Includes motion input, scheduling, and enhanced user feedback
 */
export const RoundForm = ({ 
  tournamentId, 
  onSave, 
  isLoading = false,
  existingRounds = []
}: RoundFormProps) => {
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<RoundFormData>({
    resolver: zodResolver(roundFormSchema),
    defaultValues: {
      round_number: 1,
      motion: '',
      info_slide: '',
      start_time: new Date().toISOString().slice(0, 16)
    }
  });

  const onSubmit = async (data: RoundFormData) => {
    // Check for duplicate round numbers
    if (existingRounds.includes(data.round_number)) {
      setError('round_number', {
        type: 'manual',
        message: 'This round number already exists'
      });
      return;
    }

    setOperationStatus('loading');
    setErrorMessage('');
    
    try {
      await onSave(data);
      setOperationStatus('success');
      reset();
      
      // Reset status after showing success
      setTimeout(() => setOperationStatus('idle'), 3000);
    } catch (error) {
      setOperationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create round');
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
            errorMessage={errorMessage || "Failed to create round. Please try again."}
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
                  valueAsNumber: true
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
              {errors.start_time && (
                <p className="text-sm text-red-600 mt-1">{errors.start_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="motion">Motion</Label>
            <Textarea
              id="motion"
              {...register("motion")}
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
            {errors.info_slide && (
              <p className="text-sm text-red-600 mt-1">{errors.info_slide.message}</p>
            )}
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
