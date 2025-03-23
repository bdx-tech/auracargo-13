
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  FileText, 
  Upload, 
  Download,
  FileCheck,
  FileWarning,
  Plus,
  Eye,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentsPageProps {
  userId: string | undefined;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  // Template data (static for now)
  const templates = [
    { id: "TPL-001", name: "Commercial Invoice Template", type: "invoice", category: "International" },
    { id: "TPL-002", name: "Bill of Lading Template", type: "bl", category: "Sea Freight" },
    { id: "TPL-003", name: "Air Waybill Template", type: "awb", category: "Air Freight" },
    { id: "TPL-004", name: "Customs Declaration Form", type: "customs", category: "Customs" },
    { id: "TPL-005", name: "Dangerous Goods Declaration", type: "dangerous", category: "Compliance" }
  ];
  
  const fetchDocuments = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError("");
    
    try {
      let query = supabase
        .from('documents')
        .select('*, shipments:shipment_id(tracking_number)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      // Apply search filter if present
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        // If table doesn't exist, we'll create sample data
        if (error.code === 'PGRST116') {
          setDocuments([]);
        } else {
          throw error;
        }
      } else {
        setDocuments(data || []);
      }
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError("Failed to fetch documents. Please try again.");
      toast({
        variant: "destructive",
        title: "Error loading documents",
        description: "There was a problem loading your documents."
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [userId]);
  
  const handleSearch = () => {
    fetchDocuments();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kargon-dark">Documents</h1>
        <Button className="bg-kargon-red hover:bg-kargon-red/90">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>
      
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Documents</CardTitle>
                  <CardDescription>Manage your shipping documents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-8 w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={fetchDocuments}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex items-center gap-2 text-red-500 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              ) : null}
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(4).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : documents.length > 0 ? (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.id.substring(0, 8)}</TableCell>
                          <TableCell>{doc.name}</TableCell>
                          <TableCell className="capitalize">{doc.document_type}</TableCell>
                          <TableCell>{doc.shipments?.tracking_number || 'N/A'}</TableCell>
                          <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {doc.verified ? (
                              <div className="flex items-center text-green-600">
                                <FileCheck className="mr-1 h-4 w-4" />
                                <span>Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-600">
                                <FileWarning className="mr-1 h-4 w-4" />
                                <span>Pending</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No documents found. Upload a document to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>Use these templates for your shipping documents</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.id}</TableCell>
                        <TableCell>{template.name}</TableCell>
                        <TableCell className="capitalize">{template.type}</TableCell>
                        <TableCell>{template.category}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsPage;
