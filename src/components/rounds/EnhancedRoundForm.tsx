import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, X, Info, AlertTriangle } from "lucide-react";
import { DEBATE_FORMATS, DebateFormat } from "@/types/formats";

interface EnhancedRoundFormData {
  round_number: number;
  motion: string;
  info_slide: string;
  start_time: string;
  is_motion_public: boolean;
  is_info_slide_public: boolean;
  rooms: string[];
}

interface EnhancedRoundFormProps {
  onSave: (data: EnhancedRoundFormData) => Promise<void>;
  isLoading?: boolean;
  tournamentFormat?: DebateFormat;
  teamCount?: number;
  existingRounds?: number[];
  initialData?: Partial<EnhancedRoundFormData>;
}

export const EnhancedRoundForm = ({ 
  onSave, 
  isLoading = false, 
  tournamentFormat = 'bp',
  teamCount = 0,
  existingRounds = [],
  initialData
}: EnhancedRoundFormProps) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<EnhancedRoundFormData>({
    defaultValues: {
      is_motion_public: false,
      is_info_slide_public: false,
      rooms: ['Room A'],
      ...initialData
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<string[]>(initialData?.rooms || ['Room A']);

  // Get format specification
  const formatSpec = DEBATE_FORMATS[tournamentFormat];
  const teamsPerRoom = formatSpec.teamsPerDebate;
  const recommendedRooms = teamCount > 0 ? Math.ceil(teamCount / teamsPerRoom) : 1;
  const minRooms = Math.max(1, Math.ceil(teamCount / teamsPerRoom));
  const maxRooms = Math.max(minRooms, Math.ceil(teamCount / Math.max(1, teamsPerRoom - 1)));

  // Validation messages
  const getRoomValidationMessage = () => {
    if (teamCount === 0) return null;
    
    if (rooms.length < minRooms) {
      return `Need at least ${minRooms} rooms for ${teamCount} teams (${teamsPerRoom} teams per room)`;
    }
    
    if (rooms.length > maxRooms) {
      return `Too many rooms. With ${teamCount} teams, you need ${minRooms}-${maxRooms} rooms`;
    }
    
    return null;
  };

  const validationMessage = getRoomValidationMessage();
  const isRoomCountValid = !validationMessage;

  const addRoom = () => {
    const newRoom = `Room ${String.fromCharCode(65 + rooms.length)}`;
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    setValue('rooms', updatedRooms);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
    setValue('rooms', updatedRooms);
  };

  const updateRoom = (index: number, value: string) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = value;
    setRooms(updatedRooms);
    setValue('rooms', updatedRooms);
  };

  const autoGenerateRooms = () => {
    const generatedRooms = [];
    for (let i = 0; i < recommendedRooms; i++) {
      generatedRooms.push(`Room ${String.fromCharCode(65 + i)}`);
    }
    setRooms(generatedRooms);
    setValue('rooms', generatedRooms);
  };

  const onSubmit = async (data: EnhancedRoundFormData) => {
    if (!isRoomCountValid) {
      return; // Don't submit if room count is invalid
    }
    
    setIsSaving(true);
    try {
      await onSave({
        ...data,
        rooms: rooms
      });
      reset();
      setRooms(['Room A']);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSaving(false);
    }
  };

  // Check for duplicate round numbers
  const roundNumber = watch('round_number');
  const isDuplicateRound = existingRounds.includes(roundNumber);

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
          {initialData ? 'Edit Round' : 'Create New Round'}
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
              {isDuplicateRound && (
                <p className="text-sm text-red-500 mt-1">Round {roundNumber} already exists</p>
              )}
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

          {/* Room Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rooms</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formatSpec.shortName}: {teamsPerRoom} teams/room
                </Badge>
                {teamCount > 0 && (
                  <Badge variant="secondary">
                    {teamCount} teams → {recommendedRooms} rooms recommended
                  </Badge>
                )}
              </div>
            </div>

            {/* Format and team count info */}
            {teamCount > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>{formatSpec.name}</strong> requires {teamsPerRoom} teams per room. 
                  With {teamCount} teams, you need {minRooms}-{maxRooms} rooms.
                </AlertDescription>
              </Alert>
            )}

            {/* Room validation warning */}
            {validationMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}

            {/* Auto-generate button */}
            {teamCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={autoGenerateRooms}
                disabled={isSaving}
              >
                Auto-generate {recommendedRooms} rooms
              </Button>
            )}

            {/* Room list */}
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
            disabled={isSaving || !isRoomCountValid || isDuplicateRound}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {initialData ? 'Updating Round...' : 'Creating Round...'}
              </>
            ) : (
              initialData ? 'Update Round' : 'Create Round'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
