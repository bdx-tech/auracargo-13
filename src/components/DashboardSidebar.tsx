
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  User,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: any;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  profile,
  isCollapsed = false,
  toggleCollapse
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "shipments", label: "Shipments", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Generate customer ID if not available
  const customerId = profile?.id ? `C-${profile.id.substring(0, 5)}` : 'Loading...';
  
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit transition-all duration-300",
      isCollapsed ? "w-20" : "w-full md:w-64"
    )}>
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className={cn(
        "flex flex-col items-center mb-6 pt-2",
        isCollapsed ? "space-y-1" : "space-y-2"
      )}>
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <User className="h-8 w-8 text-gray-500" />
        </div>
        {!isCollapsed && (
          <>
            <h3 className="font-medium text-center">
              {profile?.first_name && profile?.last_name ? 
                `${profile.first_name} ${profile.last_name}` : 
                'Loading...'}
            </h3>
            <p className="text-sm text-gray-500 text-center">Customer ID: {customerId}</p>
          </>
        )}
      </div>
      
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              `w-full justify-${isCollapsed ? "center" : "start"}`,
              activeTab === item.id ? "bg-kargon-red hover:bg-kargon-red/90" : ""
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && item.label}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          className={cn(`w-full justify-${isCollapsed ? "center" : "start"}`)}
          onClick={() => navigate('/support')}
        >
          <HeadphonesIcon className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && "Support"}
        </Button>
      </div>
      
      <div className="pt-6 mt-6 border-t border-gray-100">
        <Button 
          variant="outline" 
          className={cn(
            `w-full justify-${isCollapsed ? "center" : "start"} text-red-500 hover:text-red-600 hover:bg-red-50`
          )}
          onClick={signOut}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
