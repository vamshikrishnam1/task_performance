import { ChartLine, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportForm from "@/components/report-form";
import RecentReports from "@/components/recent-reports";

export default function Dashboard() {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export functionality to be implemented");
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
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Last Updated: <span>Today, 2:30 PM</span>
              </span>
              <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ReportForm />
          <RecentReports />
        </div>
      </main>
    </div>
  );
}
