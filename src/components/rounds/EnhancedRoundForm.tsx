
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Target, Plus, X } from "lucide-react";

interface EnhancedRoundFormData {
  round_number: number;
  motion: string;
  info_slide: string;
  start_time: string;
  is_motion_public: boolean;
  is_info_slide_public: boolean;
  default_rooms: string[];
}

interface EnhancedRoundFormProps {
  onSave: (data: EnhancedRoundFormData) => Promise<void>;
  isLoading?: boolean;
}

export const EnhancedRoundForm = ({ onSave, isLoading = false }: EnhancedRoundFormProps) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<EnhancedRoundFormData>({
    defaultValues: {
      is_motion_public: false,
      is_info_slide_public: false,
      default_rooms: ['Room A']
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<string[]>(['Room A']);

  const addRoom = () => {
    const newRoom = `Room ${String.fromCharCode(65 + rooms.length)}`;
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    setValue('default_rooms', updatedRooms);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
    setValue('default_rooms', updatedRooms);
  };

  const updateRoom = (index: number, value: string) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = value;
    setRooms(updatedRooms);
    setValue('default_rooms', updatedRooms);
  };

  const onSubmit = async (data: EnhancedRoundFormData) => {
    setIsSaving(true);
    try {
      await onSave({
        ...data,
        default_rooms: rooms
      });
      reset();
      setRooms(['Room A']);
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
          <LoadingSpinner size="lg" text="Loading round form..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Create New Round
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round_number">Round Number *</Label>
              <Input
                id="round_number"
                type="number"
                min="1"
                {...register("round_number", { required: true, valueAsNumber: true })}
                placeholder="1"
                disabled={isSaving}
              />
            </div>
            
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register("start_time")}
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motion">Motion *</Label>
            <Textarea
              id="motion"
              {...register("motion", { required: true })}
              placeholder="This House believes that..."
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="info_slide">Info Slide</Label>
            <Textarea
              id="info_slide"
              {...register("info_slide")}
              placeholder="Additional information for debaters and judges..."
              rows={4}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-4">
            <Label>Default Rooms</Label>
            <div className="space-y-2">
              {rooms.map((room, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={room}
                    onChange={(e) => updateRoom(index, e.target.value)}
                    placeholder={`Room ${String.fromCharCode(65 + index)}`}
                    disabled={isSaving}
                  />
                  {rooms.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRoom(index)}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRoom}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Privacy Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_motion_public"
                  onCheckedChange={(checked) => setValue('is_motion_public', !!checked)}
                  disabled={isSaving}
                />
                <Label htmlFor="is_motion_public" className="text-sm">
                  Make motion visible to public access
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_info_slide_public"
                  onCheckedChange={(checked) => setValue('is_info_slide_public', !!checked)}
                  disabled={isSaving}
                />
                <Label htmlFor="is_info_slide_public" className="text-sm">
                  Make info slide visible to public access
                </Label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Round...
              </>
            ) : (
              'Create Round'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
