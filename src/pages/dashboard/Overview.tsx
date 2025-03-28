
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Clock, 
  Truck, 
  Search,
  FileText,
  Plus,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TrackShipmentModal from "@/components/TrackShipmentModal";
import GenerateReportModal from "@/components/GenerateReportModal";
import { useNavigate } from "react-router-dom";

interface OverviewPageProps {
  loading: boolean;
  data: {
    shipments: any[];
    notifications: any[];
  };
  setActiveTab: (tab: string) => void;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ loading, data, setActiveTab }) => {
  const { shipments, notifications } = data;
  const navigate = useNavigate();
  
  const [isTrackShipmentOpen, setIsTrackShipmentOpen] = useState(false);
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  
  const recentShipments = shipments.slice(0, 4);
  const activeShipments = shipments.filter(ship => ship.status === 'in-transit').length;
  const pendingApprovals = shipments.filter(ship => ship.status === 'pending').length;
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "in-transit":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  const handleNavigateToCreateShipment = () => {
    navigate('/create-shipment');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kargon-dark">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Search shipments..." 
            className="max-w-xs"
          />
          <Button size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-kargon-red" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{shipments.length}</div>
                <p className="text-xs text-gray-500 mt-1">All your shipments</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-kargon-red" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeShipments}</div>
                <p className="text-xs text-gray-500 mt-1">Currently in transit</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-kargon-red" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingApprovals}</div>
                <p className="text-xs text-gray-500 mt-1">Require your attention</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Shipments</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-kargon-red"
            onClick={() => setActiveTab("shipments")}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentShipments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
                    <TableCell>{shipment.origin}</TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(shipment.status)}>
                        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No shipments found. Create your first shipment to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleNavigateToCreateShipment}
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Shipment
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setIsGenerateReportOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setIsTrackShipmentOpen(true)}
            >
              <Truck className="mr-2 h-4 w-4" /> Track Shipment
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="border-b pb-4">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No notifications at this time.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      <TrackShipmentModal
        open={isTrackShipmentOpen}
        onOpenChange={setIsTrackShipmentOpen}
      />
      
      <GenerateReportModal
        open={isGenerateReportOpen}
        onOpenChange={setIsGenerateReportOpen}
      />
    </div>
  );
};

export default OverviewPage;
