import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Eye, Download, Trash2, FileText, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type WeeklyReport } from "@shared/schema";

export default function RecentReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/reports"],
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reports/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const handleView = (report: WeeklyReport) => {
    // TODO: Implement view functionality
    console.log("View report:", report);
    toast({
      title: "View Report",
      description: "Report viewing functionality to be implemented",
    });
  };

  const handleExport = (report: WeeklyReport) => {
    // TODO: Implement export functionality
    console.log("Export report:", report);
    toast({
      title: "Export Report", 
      description: "Report export functionality to be implemented",
    });
  };

  const handleDelete = (id: number) => {
    deleteReportMutation.mutate(id);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffTime = now.getTime() - reportDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <History className="h-5 w-5 mr-2 text-slate-600" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-300 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-slate-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-slate-300 rounded w-16"></div>
                    <div className="h-6 bg-slate-300 rounded w-16"></div>
                    <div className="h-6 bg-slate-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
          <History className="h-5 w-5 mr-2 text-slate-600" />
          Recent Reports
        </CardTitle>
        <p className="text-sm text-slate-600">View and manage previously generated reports</p>
      </CardHeader>
      
      <CardContent className="p-6">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium">No reports found</p>
            <p className="text-sm">Create your first report to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Week of {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Owner: <span className="capitalize">{report.weekOwner}</span> • 
                      Created: <span>{getRelativeTime(report.createdAt)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(report)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(report)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    disabled={deleteReportMutation.isPending}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
