import { ArrowLeft, Calendar, User, FileText, TrendingUp, TrendingDown, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type WeeklyReport } from "@shared/schema";

interface ReportViewProps {
  report: WeeklyReport;
  onBack: () => void;
}

const teamMemberDisplayNames: Record<string, string> = {
  deepak: "Deepak",
  jitin: "Jitin", 
  minhaj: "Minhaj",
  prateek: "Prateek",
  ashish: "Ashish",
  devops: "DevOps",
  qateam: "QA Team",
  vamshi: "Vamshi"
};

const teamMemberAvatars: Record<string, string> = {
  deepak: "D",
  jitin: "J",
  minhaj: "M", 
  prateek: "P",
  ashish: "A",
  devops: "D",
  qateam: "Q",
  vamshi: "V"
};

const avatarColors: Record<string, string> = {
  deepak: "bg-blue-100 text-blue-600",
  jitin: "bg-green-100 text-green-600",
  minhaj: "bg-purple-100 text-purple-600",
  prateek: "bg-orange-100 text-orange-600",
  ashish: "bg-indigo-100 text-indigo-600",
  devops: "bg-cyan-100 text-cyan-600",
  qateam: "bg-red-100 text-red-600",
  vamshi: "bg-yellow-100 text-yellow-600"
};

export default function ReportView({ report, onBack }: ReportViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (value: number) => {
    if (value >= 80) return "bg-green-100 text-green-800";
    if (value >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPerformanceIcon = (value: number) => {
    if (value >= 80) return <TrendingUp className="h-4 w-4" />;
    if (value >= 60) return <Award className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const teamMembers = Object.entries(report.teamData || {});
  const totalTasks = teamMembers.reduce((sum, [_, data]) => sum + data.assigned, 0);
  const totalCompleted = teamMembers.reduce((sum, [_, data]) => sum + data.completed, 0);
  const avgTCR = teamMembers.length > 0 ? teamMembers.reduce((sum, [_, data]) => sum + data.tcr, 0) / teamMembers.length : 0;
  const avgTPR = teamMembers.length > 0 ? teamMembers.reduce((sum, [_, data]) => sum + data.tpr, 0) / teamMembers.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="h-6 w-px bg-slate-300" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Weekly Report Details
            </h1>
            <p className="text-slate-600">
              {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Week Owner</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {report.weekOwner}
                </p>
              </div>
              <User className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
                <p className="text-sm text-slate-500">{totalCompleted} completed</p>
              </div>
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg TCR</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgTCR)}`}>
                  {avgTCR.toFixed(1)}%
                </p>
              </div>
              {getPerformanceIcon(avgTCR)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg TPR</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgTPR)}`}>
                  {avgTPR.toFixed(1)}%
                </p>
              </div>
              {getPerformanceIcon(avgTPR)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Team Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Team Member</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Assigned</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Completed</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Critical</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Major</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Minor</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">TCR %</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">TPR %</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(([member, data]) => (
                  <tr key={member} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${avatarColors[member]}`}>
                          <span className="text-sm font-medium">
                            {teamMemberAvatars[member]}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">
                          {teamMemberDisplayNames[member]}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-900">
                      {data.assigned}
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-900">
                      {data.completed}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {data.critical > 0 ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          {data.critical}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {data.major > 0 ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {data.major}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {data.minor > 0 ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {data.minor}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getPerformanceBadge(data.tcr)}>
                        {data.tcr.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getPerformanceBadge(data.tpr)}>
                        {data.tpr.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Report Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Report ID</p>
              <p className="text-lg font-semibold text-slate-900">#{report.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Created At</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatDate(report.createdAt.toString())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}