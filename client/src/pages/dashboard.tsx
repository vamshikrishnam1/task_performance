import { useState } from "react";
import { ChartLine, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportForm from "@/components/report-form";
import RecentReports from "@/components/recent-reports";
import ReportView from "@/components/report-view";
import { type WeeklyReport } from "@shared/schema";

type DashboardView = 'reports' | 'create' | 'view';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('reports');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export functionality to be implemented");
  };

  const handleViewReport = (report: WeeklyReport) => {
    setSelectedReport(report);
    setCurrentView('view');
  };

  const handleCreateNewReport = () => {
    setCurrentView('create');
  };

  const handleBackToReports = () => {
    setCurrentView('reports');
    setSelectedReport(null);
  };

  const handleReportCreated = () => {
    setCurrentView('reports');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return <ReportForm onReportCreated={handleReportCreated} onCancel={handleBackToReports} />;
      case 'view':
        return selectedReport ? <ReportView report={selectedReport} onBack={handleBackToReports} /> : null;
      default:
        return <RecentReports onViewReport={handleViewReport} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'create':
        return 'Create New Weekly Report';
      case 'view':
        return 'Weekly Report Details';
      default:
        return 'Weekly Reports';
    }
  };

  const getHeaderActions = () => {
    if (currentView === 'reports') {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">
            Last Updated: <span>Today, 2:30 PM</span>
          </span>
          <Button onClick={handleCreateNewReport} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Report
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-600">
          Last Updated: <span>Today, 2:30 PM</span>
        </span>
        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ChartLine className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                Team Performance Dashboard
              </h1>
              {currentView !== 'reports' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-lg font-medium text-slate-700">
                    {getHeaderTitle()}
                  </span>
                </>
              )}
            </div>
            {getHeaderActions()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
