
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: any;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  profile
}) => {
  const { signOut } = useAuth();
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "shipments", label: "Shipments", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Generate customer ID if not available
  const customerId = profile?.id ? `C-${profile.id.substring(0, 5)}` : 'Loading...';
  
  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
      <div className="flex flex-col items-center mb-6 pt-2">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <User className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="font-medium">{profile?.first_name && profile?.last_name ? 
          `${profile.first_name} ${profile.last_name}` : 
          'Loading...'}</h3>
        <p className="text-sm text-gray-500">Customer ID: {customerId}</p>
      </div>
      
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === item.id ? "bg-kargon-red hover:bg-kargon-red/90" : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
      
      <div className="pt-6 mt-6 border-t border-gray-100">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
