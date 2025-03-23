
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Clock, 
  Truck, 
  Search,
  FileText,
  Plus,
  ChevronRight,
  RefreshCw
} from "lucide-react";

interface OverviewPageProps {
  userId: string | undefined;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    pendingApprovals: 0
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();
  
  const fetchData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch total shipments count
      const { count: totalCount, error: totalError } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (totalError) throw totalError;
      
      // Fetch active shipments count (not delivered or completed)
      const { count: activeCount, error: activeError } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['in-transit', 'pending']);
      
      if (activeError) throw activeError;
      
      // Fetch pending approvals count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Fetch recent shipments
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (shipmentsError) throw shipmentsError;
      
      // Fetch notifications (we'll create this table if it doesn't exist)
      // For now, fetch recent shipment status changes as notifications
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (notifsError && notifsError.code !== 'PGRST116') {
        // PGRST116 means the table doesn't exist, which we'll handle
        throw notifsError;
      }
      
      setStats({
        totalShipments: totalCount || 0,
        activeShipments: activeCount || 0,
        pendingApprovals: pendingCount || 0
      });
      
      setRecentShipments(shipments || []);
      setNotifications(notifs || []);
      
      // If notifications table doesn't exist, create it with some sample data
      if (notifsError && notifsError.code === 'PGRST116') {
        await setupNotificationsTable(userId);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const setupNotificationsTable = async (userId: string) => {
    try {
      // We can't create tables from the client side directly with Supabase
      // Instead, in a real app, you'd do this via a migration or supabase function
      // For now, let's just create sample notification data for our UI
      
      const sampleNotifications = [
        {
          id: 1,
          title: "Shipment update",
          content: "Your shipment is arriving today",
          created_at: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          title: "Quote request",
          content: "New quote request submitted",
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          read: true
        },
        {
          id: 3,
          title: "Report ready",
          content: "Your monthly report is ready",
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          read: true
        }
      ];
      
      setNotifications(sampleNotifications);
      
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [userId]);

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
                <div className="text-2xl font-bold">{stats.totalShipments}</div>
                <p className="text-xs text-gray-500 mt-1">All shipments</p>
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
                <div className="text-2xl font-bold">{stats.activeShipments}</div>
                <p className="text-xs text-gray-500 mt-1">In transit or pending</p>
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
                <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
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
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-kargon-red"
              onClick={() => setActiveTab("shipments")}
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
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
            <div className="text-center py-8 text-gray-500">
              No shipments found. Create your first shipment to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create New Shipment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
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
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <p className="font-medium">{notification.title || notification.content}</p>
                    <p className="text-sm text-gray-500">
                      {notification.created_at 
                        ? new Date(notification.created_at).toLocaleDateString()
                        : 'Recent'}
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
    </div>
  );
};

export default OverviewPage;
