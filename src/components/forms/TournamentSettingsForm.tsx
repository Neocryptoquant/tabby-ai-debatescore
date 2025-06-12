import React from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { ExperienceLevel, BreakCategory } from '@/types/tournament';

interface TournamentSettingsFormProps {
  form: UseFormReturn<FieldValues>;
  breakCategories: BreakCategory[];
  setBreakCategories: (categories: BreakCategory[]) => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['novice', 'intermediate', 'open', 'pro'];

export const TournamentSettingsForm: React.FC<TournamentSettingsFormProps> = ({
  form,
  breakCategories,
  setBreakCategories
}) => {
  const { watch, setValue } = form;

  const addBreakCategory = () => {
    const newCategory: BreakCategory = {
      id: `category-${Date.now()}`,
      name: '',
      experience_levels: [],
      min_teams: 4,
      max_teams: undefined
    };
    setBreakCategories([...breakCategories, newCategory]);
  };

  const updateBreakCategory = (index: number, field: keyof BreakCategory, value: string | number | undefined | ExperienceLevel[]) => {
    const updated = [...breakCategories];
    updated[index] = { ...updated[index], [field]: value };
    setBreakCategories(updated);
  };

  const removeBreakCategory = (index: number) => {
    setBreakCategories(breakCategories.filter((_, i) => i !== index));
  };

  const toggleExperienceLevel = (categoryIndex: number, level: ExperienceLevel) => {
    const category = breakCategories[categoryIndex];
    const levels = category.experience_levels.includes(level)
      ? category.experience_levels.filter(l => l !== level)
      : [...category.experience_levels, level];
    updateBreakCategory(categoryIndex, 'experience_levels', levels);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="team_count">Number of Teams</Label>
            <Input
              id="team_count"
              type="number"
              min="2"
              max="256"
              {...form.register("team_count", { 
                valueAsNumber: true,
                min: { value: 2, message: "Minimum 2 teams required" },
                max: { value: 256, message: "Maximum 256 teams allowed" }
              })}
            />
          </div>
          <div>
            <Label htmlFor="round_count">Number of Rounds</Label>
            <Input
              id="round_count"
              type="number"
              min="1"
              max="20"
              {...form.register("round_count", { 
                valueAsNumber: true,
                min: { value: 1, message: "Minimum 1 round required" },
                max: { value: 20, message: "Maximum 20 rounds allowed" }
              })}
            />
          </div>
          <div>
            <Label htmlFor="break_type">Break Structure</Label>
            <Select 
              value={watch("break_type") || "none"} 
              onValueChange={(value) => setValue("break_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select break type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Breaks</SelectItem>
                <SelectItem value="finals">Finals Only</SelectItem>
                <SelectItem value="semis">Semi-Finals</SelectItem>
                <SelectItem value="quarters">Quarter-Finals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Break Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Break Categories</Label>
            <Button 
              type="button" 
              onClick={addBreakCategory}
              variant="outline" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          {breakCategories.map((category, index) => (
            <Card key={category.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Category name (e.g., Open, Novice)"
                    value={category.name}
                    onChange={(e) => updateBreakCategory(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeBreakCategory(index)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm">Experience Levels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <Badge
                        key={level}
                        variant={category.experience_levels.includes(level) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleExperienceLevel(index, level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Min Teams</Label>
                    <Input
                      type="number"
                      value={category.min_teams || ''}
                      onChange={(e) => updateBreakCategory(index, 'min_teams', parseInt(e.target.value) || undefined)}
                      placeholder="4"
                      min="2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Max Teams (optional)</Label>
                    <Input
                      type="number"
                      value={category.max_teams || ''}
                      onChange={(e) => updateBreakCategory(index, 'max_teams', parseInt(e.target.value) || undefined)}
                      placeholder="No limit"
                      min="2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};