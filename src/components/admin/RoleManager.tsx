
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";

/**
 * Component that allows users to assign themselves the tab_master role
 * This is typically used for initial setup or development purposes
 */
export function RoleManager() {
  const { user } = useAuth();
  const { role, isLoading } = useUserRole();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Assigns the tab_master role to the current user
   * First removes any existing role, then inserts the new one
   */
  const assignTabMasterRole = async () => {
    if (!user) {
      toast.error("Must be logged in");
      return;
    }

    setIsUpdating(true);
    try {
      console.log('Assigning tab master role to user:', user.id);
      
      // First delete any existing role for this user to avoid conflicts
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.log('Delete error (this is normal if no role exists):', deleteError);
      }

      // Insert the new tab_master role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'tab_master' })
        .select()
        .single();

      if (error) {
        console.error('Error assigning role:', error);
        toast.error(`Failed to assign role: ${error.message}`);
      } else {
        console.log('Role assigned successfully:', data);
        toast.success("Tab master role assigned successfully!");
        // Refresh the page to update the role throughout the app
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to assign role");
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  // Show loading state while fetching user role
  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tabby-secondary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          Current role: <span className="font-medium">{role || 'None'}</span>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          You need the "tab_master" role to create and manage tournaments. Click below to assign yourself this role.
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
