import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Eye, Download, Trash2, FileText, Inbox, Calendar, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type WeeklyReport } from "@shared/schema";

interface RecentReportsProps {
  onViewReport: (report: WeeklyReport) => void;
}

export default function RecentReports({ onViewReport }: RecentReportsProps) {
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
    onViewReport(report);
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

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return "text-green-600 bg-green-100";
    if (value >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const calculateReportSummary = (report: WeeklyReport) => {
    const teamData = Object.values(report.teamData || {});
    if (teamData.length === 0) return { avgTCR: 0, avgTPR: 0, totalTasks: 0, totalCompleted: 0 };
    
    const totalTasks = teamData.reduce((sum, data) => sum + data.assigned, 0);
    const totalCompleted = teamData.reduce((sum, data) => sum + data.completed, 0);
    const avgTCR = teamData.reduce((sum, data) => sum + data.tcr, 0) / teamData.length;
    const avgTPR = teamData.reduce((sum, data) => sum + data.tpr, 0) / teamData.length;
    
    return { avgTCR: Math.round(avgTCR * 10) / 10, avgTPR: Math.round(avgTPR * 10) / 10, totalTasks, totalCompleted };
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Reports</p>
                  <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Latest Report</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {reports[0]?.weekOwner || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {reports[0] ? getRelativeTime(reports[0].createdAt) : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Team Members</p>
                  <p className="text-3xl font-bold text-slate-900">8</p>
                </div>
                <Users className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports List */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <History className="h-5 w-5 mr-2 text-slate-600" />
            Weekly Reports
          </CardTitle>
          <p className="text-sm text-slate-600">View and manage team performance reports</p>
        </CardHeader>
        
        <CardContent className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-medium mb-2">No reports yet</h3>
              <p className="text-sm mb-4">Create your first weekly report to start tracking team performance</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const summary = calculateReportSummary(report);
                return (
                  <div
                    key={report.id}
                    className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Week of {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Owner: <span className="capitalize font-medium">{report.weekOwner}</span> • 
                              Created: <span>{getRelativeTime(report.createdAt)}</span> • 
                              Report #{report.id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-600 mb-1">Total Tasks</p>
                            <p className="text-lg font-bold text-slate-900">{summary.totalTasks}</p>
                            <p className="text-xs text-slate-500">{summary.totalCompleted} completed</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-600 mb-1">Avg TCR</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-bold text-slate-900">{summary.avgTCR}%</p>
                              <Badge className={`text-xs ${getPerformanceColor(summary.avgTCR)}`}>
                                {summary.avgTCR >= 80 ? 'Excellent' : summary.avgTCR >= 60 ? 'Good' : 'Needs Improvement'}
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-600 mb-1">Avg TPR</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-bold text-slate-900">{summary.avgTPR}%</p>
                              <Badge className={`text-xs ${getPerformanceColor(summary.avgTPR)}`}>
                                {summary.avgTPR >= 80 ? 'Excellent' : summary.avgTPR >= 60 ? 'Good' : 'Needs Improvement'}
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-600 mb-1">Team Size</p>
                            <p className="text-lg font-bold text-slate-900">{Object.keys(report.teamData || {}).length}</p>
                            <p className="text-xs text-slate-500">members</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleView(report)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(report)}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                          disabled={deleteReportMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
