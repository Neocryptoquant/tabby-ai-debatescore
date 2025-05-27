
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";
import { TeamForm } from "./TeamForm";
import { TeamsList } from "./TeamsList";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TeamsTabsContentProps {
  transformedTeams: any[];
  isLoading: boolean;
  isSaving: boolean;
  handleAddTeam: (data: any) => Promise<void>;
  handleEditTeam: (team: any) => void;
  handleDeleteTeam: (teamId: string) => Promise<void>;
  handleBulkImport: () => void;
  teams: any[];
}

/**
 * Content components for each tab in the Teams interface
 * Separated for better code organization and maintainability
 */
export const TeamsTabsContent = ({
  transformedTeams,
  isLoading,
  isSaving,
  handleAddTeam,
  handleEditTeam,
  handleDeleteTeam,
  handleBulkImport,
  teams
}: TeamsTabsContentProps) => {
  return (
    <>
      <TabsContent value="manage" className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <LoadingSpinner size="lg" text="Loading teams..." />
            </CardContent>
          </Card>
        ) : (
          <TeamsList
            teams={transformedTeams}
            onEdit={handleEditTeam}
            onDelete={handleDeleteTeam}
            isLoading={isLoading}
          />
        )}
      </TabsContent>

      <TabsContent value="add" className="space-y-6">
        <TeamForm
          onSave={handleAddTeam}
          isLoading={isSaving}
        />
      </TabsContent>

      <TabsContent value="import" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Import Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Import Teams from CSV</h3>
              <p className="text-gray-500 mt-2 mb-4">Upload a CSV file to register multiple teams at once</p>
              <Button onClick={handleBulkImport} className="gap-2">
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-tabby-secondary">{teams.length}</div>
                  <div className="text-sm text-gray-500">Total Teams</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-tabby-secondary">{teams.length * 2}</div>
                  <div className="text-sm text-gray-500">Total Speakers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-tabby-secondary">
                    {new Set(teams.map(t => t.institution).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-gray-500">Institutions</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Detailed Analytics</h3>
              <p className="text-gray-500 mt-2">Advanced team analytics coming soon</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};
