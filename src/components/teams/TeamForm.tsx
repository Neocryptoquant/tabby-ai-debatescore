
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Users } from "lucide-react";

interface TeamFormData {
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
}

interface TeamFormProps {
  onSave: (data: TeamFormData) => void;
  isLoading?: boolean;
}

export const TeamForm = ({ onSave, isLoading = false }: TeamFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>();

  const onSubmit = (data: TeamFormData) => {
    console.log('Creating new team:', data);
    onSave(data);
    reset();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Team name is required" })}
                placeholder="Team Alpha"
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
                />
              </div>

              <div>
                <Label htmlFor="speaker4_name">Speaker 4</Label>
                <Input
                  id="speaker4_name"
                  {...register("speaker4_name")}
                  placeholder="Fourth speaker name (optional)"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Adding Team...
              </>
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
