
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("shipments");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [fileFormat, setFileFormat] = useState("csv");

  const handleGenerateReport = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would connect to a backend service to generate and download the report
      // For our dummy implementation, we'll just show a toast and simulate success
      
      setTimeout(() => {
        toast({
          title: "Report Generated",
          description: `Your ${reportType} report has been generated and is ready to download.`,
        });
        
        // In a real app, this would trigger the download of the actual report file
        const dummyData = `Generated ${reportType} report for ${getDateRangeDescription(dateRange)} in ${fileFormat.toUpperCase()} format at ${new Date().toISOString()}`;
        const blob = new Blob([dummyData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.${fileFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setLoading(false);
        onOpenChange(false);
      }, 2000); // Simulate generation time
      
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
      setLoading(false);
    }
  };

  const getDateRangeDescription = (range: string) => {
    switch (range) {
      case "last_7_days":
        return "the last 7 days";
      case "last_30_days":
        return "the last 30 days";
      case "this_month":
        return "this month";
      case "last_month":
        return "last month";
      case "this_year":
        return "this year";
      default:
        return "the selected period";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !loading && onOpenChange(value)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Select the type of report and date range you want to generate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipments">Shipments Report</SelectItem>
                <SelectItem value="payments">Payments Report</SelectItem>
                <SelectItem value="documents">Documents Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={dateRange}
              onValueChange={setDateRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>File Format</Label>
            <RadioGroup
              value={fileFormat}
              onValueChange={setFileFormat}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx">Excel</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportModal;
