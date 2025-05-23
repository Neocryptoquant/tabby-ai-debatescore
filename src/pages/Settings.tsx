
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Settings"
        description="Manage application settings"
      />
      
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-10 text-center">
        <SettingsIcon className="h-16 w-16 text-tabby-secondary mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Application Settings</h2>
        <p className="text-gray-500 mb-6">Detailed settings interface will be shown here.</p>
      </div>
      
      <AIAssistant />
    </MainLayout>
  );
};

export default Settings;
