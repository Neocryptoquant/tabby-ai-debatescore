
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Users } from "lucide-react";

const Teams = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <MainLayout>
      <PageHeader 
        title="Teams Management"
        description="Manage all teams for this tournament"
      />
      
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-10 text-center">
        <Users className="h-16 w-16 text-tabby-secondary mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Teams Management</h2>
        <p className="text-gray-500 mb-6">Detailed team management interface will be shown here.</p>
      </div>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Teams;
