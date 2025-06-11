import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users } from "lucide-react";
import React from "react";
import { JudgeFormData, ExperienceLevel } from "@/types/tournament";

interface JudgeFormProps {
  onSave: (data: JudgeFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<JudgeFormData>;
  isEditMode?: boolean;
}

export const JudgeForm = ({ onSave, isLoading = false, defaultValues = {}, isEditMode = false }: JudgeFormProps) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<JudgeFormData>({
    defaultValues: defaultValues as JudgeFormData
  });
  const [isSaving, setIsSaving] = useState(false);

  // Set default values when editing
  React.useEffect(() => {
    if (isEditMode && defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof JudgeFormData, value as any);
      });
    }
  }, [defaultValues, isEditMode, setValue]);

  const onSubmit = async (data: JudgeFormData) => {
    setIsSaving(true);
    try {
      await onSave(data);
      if (!isEditMode) reset();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <LoadingSpinner size="lg" text="Loading judge form..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {isEditMode ? 'Edit Judge' : 'Add New Judge'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Judge Name *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter judge's full name"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                {...register("institution")}
                placeholder="University or organization"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="experience_level">Experience Level</Label>
            <Select 
              onValueChange={(value) => setValue("experience_level", value as ExperienceLevel)}
              disabled={isSaving}
              value={watch("experience_level")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novice">Novice</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditMode ? 'Updating Judge...' : 'Adding Judge...'}
              </>
            ) : (
              isEditMode ? 'Update Judge' : 'Add Judge'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
