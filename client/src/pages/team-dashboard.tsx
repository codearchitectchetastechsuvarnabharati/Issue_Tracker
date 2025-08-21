import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import IssueDetailModal from "@/components/issue-detail-modal";
import type { Issue } from "@shared/schema";

interface Stats {
  openIssues: number;
  inProgress: number;
  resolvedToday: number;
  urgent: number;
}

export default function TeamDashboard() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ['/api/issues'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000, // Auto-refresh stats every 5 seconds
  });

  // Update the time display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Team member email mapping
  const teamMemberEmails: { [key: string]: string } = {
    "Shaurya Raj": "shaurya.raj@company.com",
    "Ramesh Gowda": "ramesh.gowda@company.com", 
    "Balashankar Sharma": "balashankar.sharma@company.com",
    "Aniket Singh": "aniket.singh@company.com",
    "Wilson Murphy": "wilson.murphy@company.com",
    "Tanish Kumar": "tanish.kumar@company.com"
  };

  // Filter issues - show only active issues (not resolved/completed)
  const activeIssues = issues.filter(issue => issue.status !== 'resolved');
  
  const filteredIssues = activeIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || issue.status === statusFilter;
    const matchesPriority = !priorityFilter || priorityFilter === "all" || issue.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssueId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return 'fas fa-exclamation-triangle';
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-light text-gray-900">Team Dashboard</h2>
            <p className="text-gray-600 mt-1">Active support issues from customers worldwide - Completed issues are hidden</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">
                Live Issues: <span data-testid="text-last-updated">{lastUpdateTime.toLocaleTimeString()}</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt mr-1"></i>Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <i className="fas fa-inbox text-gray-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-light text-gray-900" data-testid="stat-open-issues">
                  {stats?.openIssues || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <i className="fas fa-clock text-warning"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-light text-gray-900" data-testid="stat-in-progress">
                  {stats?.inProgress || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-check-circle text-secondary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-light text-gray-900" data-testid="stat-resolved-today">
                  {stats?.resolvedToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <i className="fas fa-exclamation-triangle text-error"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-light text-gray-900" data-testid="stat-urgent">
                  {stats?.urgent || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-material mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <Input 
                  type="text" 
                  placeholder="Search issues..."
                  className="pl-10 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-issues"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-priority">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">
                  Auto-refreshing every 5 seconds
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Showing {filteredIssues.length} of {activeIssues.length} active global issues
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>All Issues</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="font-bold text-gray-900">STATUS</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading issues...
                    </TableCell>
                  </TableRow>
                ) : filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8" data-testid="text-no-issues">
                      No issues found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow 
                      key={issue.id} 
                      className="hover:bg-gray-50 transition-colors"
                      data-testid={`row-issue-${issue.id}`}
                    >
                      <TableCell>
                        <div>
                          <div 
                            className="text-sm font-medium text-gray-900" 
                            data-testid={`text-issue-title-${issue.id}`}
                          >
                            {issue.title}
                          </div>
                          <div 
                            className="text-sm text-gray-500" 
                            data-testid={`text-issue-id-${issue.id}`}
                          >
                            Ticket #{issue.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {issue.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div 
                              className="text-sm font-medium text-gray-900"
                              data-testid={`text-customer-name-${issue.id}`}
                            >
                              {issue.customerName}
                            </div>
                            <div 
                              className="text-sm text-gray-500"
                              data-testid={`text-customer-email-${issue.id}`}
                            >
                              {issue.customerEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          className={getPriorityColor(issue.priority)}
                          data-testid={`badge-priority-${issue.id}`}
                        >
                          {getPriorityIcon(issue.priority) && (
                            <i className={`${getPriorityIcon(issue.priority)} mr-1`}></i>
                          )}
                          {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            issue.status === 'open' ? 'bg-red-500' :
                            issue.status === 'in-progress' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                          }`}></div>
                          <Badge 
                            className={`${getStatusColor(issue.status)} font-medium`}
                            data-testid={`badge-status-${issue.id}`}
                          >
                            {issue.status === 'in-progress' ? 'IN PROGRESS' : 
                             issue.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {issue.assignedTo ? (
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary text-white">
                                {issue.assignedTo.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <div 
                                className="text-sm font-medium text-gray-900"
                                data-testid={`text-assignee-${issue.id}`}
                              >
                                {issue.assignedTo}
                              </div>
                              <div 
                                className="text-xs text-gray-500"
                                data-testid={`text-assignee-email-${issue.id}`}
                              >
                                {teamMemberEmails[issue.assignedTo] || 'email@company.com'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-gray-300 text-gray-600">?</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <span className="text-sm text-gray-500" data-testid={`text-unassigned-${issue.id}`}>
                                Unassigned
                              </span>
                              <div className="text-xs text-gray-400">No assignee</div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <span 
                          className="text-sm text-gray-500"
                          data-testid={`text-created-date-${issue.id}`}
                        >
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewIssue(issue.id)}
                          data-testid={`button-view-issue-${issue.id}`}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <IssueDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        issueId={selectedIssueId}
      />
    </div>
  );
}
