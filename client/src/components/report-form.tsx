import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calculator, Save, RefreshCw, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TEAM_MEMBERS, WEEK_OWNERS, type TeamMemberData, type InsertWeeklyReport } from "@shared/schema";

const formSchema = z.object({
  weekOwner: z.string().min(1, "Week owner is required"),
  weekStart: z.string().min(1, "Week start date is required"),
  weekEnd: z.string().min(1, "Week end date is required"),
});

type FormData = z.infer<typeof formSchema>;

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

export default function ReportForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [teamData, setTeamData] = useState<Record<string, Partial<TeamMemberData>>>({});
  const [calculatedData, setCalculatedData] = useState<Record<string, { tcr: number; tpr: number }>>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekOwner: "",
      weekStart: getMonday(new Date()).toISOString().split('T')[0],
      weekEnd: getSunday(new Date()).toISOString().split('T')[0],
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: InsertWeeklyReport) => {
      const response = await apiRequest("POST", "/api/reports", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save report. Please try again.",
        variant: "destructive",
      });
    },
  });

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getSunday(date: Date): Date {
    const monday = getMonday(date);
    return new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  const updateTeamMemberData = (member: string, field: keyof TeamMemberData, value: number) => {
    setTeamData(prev => ({
      ...prev,
      [member]: {
        ...prev[member],
        [field]: value
      }
    }));
    
    // Clear calculated data for this member when input changes
    setCalculatedData(prev => {
      const newData = { ...prev };
      delete newData[member];
      return newData;
    });
  };

  const calculateMetrics = () => {
    const newCalculatedData: Record<string, { tcr: number; tpr: number }> = {};
    
    TEAM_MEMBERS.forEach(member => {
      const data = teamData[member];
      if (!data) return;
      
      const assigned = data.assigned || 0;
      const completed = data.completed || 0;
      const critical = data.critical || 0;
      const major = data.major || 0;
      const minor = data.minor || 0;
      
      // Calculate TCR
      const tcr = assigned > 0 ? (completed / assigned) * 100 : 0;
      
      // Calculate TPR
      const totalBugs = critical + major + minor;
      const weightedBugScore = (critical * 5) + (major * 3) + (minor * 1);
      const maxPossibleWeightedBugScore = totalBugs * 5;
      
      let tpr = 0;
      if (assigned > 0) {
        if (totalBugs === 0) {
          tpr = tcr; // If no bugs, TPR equals TCR
        } else {
          tpr = (completed / assigned) * (1 - weightedBugScore / maxPossibleWeightedBugScore) * 100;
        }
      }
      
      newCalculatedData[member] = {
        tcr: Math.round(tcr * 100) / 100,
        tpr: Math.round(tpr * 100) / 100
      };
    });
    
    setCalculatedData(newCalculatedData);
    toast({
      title: "Success",
      description: "Metrics calculated successfully!",
    });
  };

  const resetForm = () => {
    form.reset();
    setTeamData({});
    setCalculatedData({});
    toast({
      title: "Form Reset",
      description: "Form reset successfully",
    });
  };

  const onSubmit = (data: FormData) => {
    // Validate that metrics have been calculated
    if (Object.keys(calculatedData).length === 0) {
      toast({
        title: "Warning",
        description: "Please calculate metrics before saving",
        variant: "destructive",
      });
      return;
    }

    // Prepare team data with calculated metrics
    const finalTeamData: Record<string, TeamMemberData> = {};
    
    TEAM_MEMBERS.forEach(member => {
      const memberData = teamData[member];
      const calculated = calculatedData[member];
      
      if (memberData && calculated) {
        finalTeamData[member] = {
          assigned: memberData.assigned || 0,
          completed: memberData.completed || 0,
          critical: memberData.critical || 0,
          major: memberData.major || 0,
          minor: memberData.minor || 0,
          tcr: calculated.tcr,
          tpr: calculated.tpr
        };
      }
    });

    const reportData: InsertWeeklyReport = {
      ...data,
      teamData: finalTeamData
    };

    createReportMutation.mutate(reportData);
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-blue-600" />
          Create New Weekly Report
        </CardTitle>
        <p className="text-sm text-slate-600">Generate performance metrics for your team</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Report Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="weekOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Week Owner <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-slate-300 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select owner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEEK_OWNERS.map(owner => (
                          <SelectItem key={owner} value={owner}>
                            {owner.charAt(0).toUpperCase() + owner.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Week Starting <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        className="border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Week Ending <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        className="border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Team Performance Table */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                <Table className="h-5 w-5 mr-2 text-slate-600" />
                Team Performance Data
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 border-b border-slate-200">
                        Team Member
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        Assigned Tasks
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        Completed Tasks
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        Critical Bugs
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        Major Bugs
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        Minor Bugs
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        TCR %
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-900 border-b border-slate-200">
                        TPR %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {TEAM_MEMBERS.map(member => (
                      <tr key={member} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${avatarColors[member]}`}>
                              <span className="text-sm font-medium">
                                {teamMemberAvatars[member]}
                              </span>
                            </div>
                            {teamMemberDisplayNames[member]}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-center border-slate-300 focus:ring-2 focus:ring-blue-500"
                            value={teamData[member]?.assigned || ""}
                            onChange={(e) => updateTeamMemberData(member, "assigned", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-center border-slate-300 focus:ring-2 focus:ring-blue-500"
                            value={teamData[member]?.completed || ""}
                            onChange={(e) => updateTeamMemberData(member, "completed", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-center border-slate-300 focus:ring-2 focus:ring-blue-500"
                            value={teamData[member]?.critical || ""}
                            onChange={(e) => updateTeamMemberData(member, "critical", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-center border-slate-300 focus:ring-2 focus:ring-blue-500"
                            value={teamData[member]?.major || ""}
                            onChange={(e) => updateTeamMemberData(member, "major", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-center border-slate-300 focus:ring-2 focus:ring-blue-500"
                            value={teamData[member]?.minor || ""}
                            onChange={(e) => updateTeamMemberData(member, "minor", parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center font-medium">
                            {calculatedData[member] ? (
                              <span className={getPerformanceColor(calculatedData[member].tcr)}>
                                {calculatedData[member].tcr.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center font-medium">
                            {calculatedData[member] ? (
                              <span className={getPerformanceColor(calculatedData[member].tpr)}>
                                {calculatedData[member].tpr.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formula Reference */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Calculation Formulas
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>TCR</strong> = (Completed Tasks / Assigned Tasks) × 100</p>
                <p><strong>TPR</strong> = (Completed Tasks / Assigned Tasks) × (1 - Weighted Bug Score / Max Possible Weighted Bug Score) × 100</p>
                <p><strong>Weighted Bug Score</strong> = (Critical × 5) + (Major × 3) + (Minor × 1)</p>
                <p><strong>Max Possible Weighted Bug Score</strong> = Total Bugs × 5</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="button" 
                onClick={calculateMetrics}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate TCR & TPR
              </Button>
              
              <Button 
                type="submit" 
                disabled={createReportMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {createReportMutation.isPending ? "Saving..." : "Save Report"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
