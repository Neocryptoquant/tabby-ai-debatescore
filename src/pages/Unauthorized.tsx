
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Unauthorized access page with helpful messaging based on user role
 */
const Unauthorized = () => {
  const { getPermissionLevel, role } = usePermissions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-700">
            <strong>Current Role:</strong> {role || 'None'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Permission Level:</strong> {getPermissionLevel()}
          </p>
        </div>
        
        <div className="space-y-3">
          <Link to="/dashboard">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          {role === 'attendee' && (
            <p className="text-xs text-gray-500">
              Contact a tournament administrator if you need additional permissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
