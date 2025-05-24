
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoleManager() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const assignTabMasterRole = async () => {
    if (!user) {
      toast.error("Must be logged in");
      return;
    }

    setIsUpdating(true);
    try {
      // First delete any existing role for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Then insert tab_master role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'tab_master' });

      if (error) {
        console.error('Error assigning role:', error);
        toast.error("Failed to assign role");
      } else {
        toast.success("Tab master role assigned successfully!");
        // Refresh the page to update the role
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to assign role");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          If you can't create tournaments, click below to assign yourself the tab master role.
        </p>
        <Button 
          onClick={assignTabMasterRole}
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Assigning..." : "Make Me Tab Master"}
        </Button>
      </CardContent>
    </Card>
  );
}
