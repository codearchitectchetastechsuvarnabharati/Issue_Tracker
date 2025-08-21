import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Issue, Comment } from "@shared/schema";

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string | null;
}

interface IssueWithComments extends Issue {
  comments: Comment[];
}

export default function IssueDetailModal({ isOpen, onClose, issueId }: IssueDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const { toast } = useToast();

  const { data: issue, isLoading } = useQuery<IssueWithComments>({
    queryKey: ['/api/issues', issueId],
    enabled: !!issueId && isOpen,
  });

  const updateIssueMutation = useMutation({
    mutationFn: async (updates: Partial<Issue>) => {
      const response = await apiRequest('PATCH', `/api/issues/${issueId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      toast({ title: "Issue updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update issue", variant: "destructive" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { author: string; content: string; isInternal: string }) => {
      const response = await apiRequest('POST', `/api/issues/${issueId}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues', issueId] });
      setNewComment("");
      setNotifyCustomer(false);
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const handleStatusChange = (status: string) => {
    updateIssueMutation.mutate({ status });
  };

  const handlePriorityChange = (priority: string) => {
    updateIssueMutation.mutate({ priority });
  };

  const handleAssigneeChange = (assignedTo: string) => {
    updateIssueMutation.mutate({ assignedTo: assignedTo === "unassigned" ? undefined : assignedTo });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      author: "Team Member", // In a real app, this would come from auth
      content: newComment,
      isInternal: notifyCustomer ? "false" : "true",
    });
  };

  const handleMarkResolved = () => {
    updateIssueMutation.mutate({ status: 'resolved' });
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

  if (!issue && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle data-testid="text-issue-title">
            {issue?.title || "Loading..."}
          </DialogTitle>
          <p className="text-sm text-gray-500" data-testid="text-issue-id">
            Ticket #{issue?.id?.slice(-8)} • Created {issue ? new Date(issue.createdAt).toLocaleDateString() : ''}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : issue ? (
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed" data-testid="text-issue-description">
                  {issue.description}
                </p>
              </div>
              
              <div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Status</Label>
                    <Select value={issue.status} onValueChange={handleStatusChange}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</Label>
                    <Select value={issue.assignedTo || "unassigned"} onValueChange={handleAssigneeChange}>
                      <SelectTrigger data-testid="select-assignee">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="Shaurya Raj">Shaurya Raj</SelectItem>
                        <SelectItem value="Ramesh Gowda">Ramesh Gowda</SelectItem>
                        <SelectItem value="Balashankar Sharma">Balashankar Sharma</SelectItem>
                        <SelectItem value="Aniket Singh">Aniket Singh</SelectItem>
                        <SelectItem value="Wilson Murphy">Wilson Murphy</SelectItem>
                        <SelectItem value="Tanish Kumar">Tanish Kumar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Priority</Label>
                    <Select value={issue.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarFallback>
                          {issue.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900" data-testid="text-customer-name">{issue.customerName}</p>
                        <p className="text-sm text-gray-500" data-testid="text-customer-email">{issue.customerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Comments & Updates</h4>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <Textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-vertical"
                  rows={3}
                  placeholder="Add a comment or update..."
                  data-testid="textarea-new-comment"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center text-sm text-gray-600">
                      <Checkbox 
                        checked={notifyCustomer} 
                        onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
                        className="mr-2"
                        data-testid="checkbox-notify-customer"
                      />
                      Notify customer via email
                    </label>
                  </div>
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    data-testid="button-add-comment"
                  >
                    <i className="fas fa-comment mr-2"></i>Add Comment
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {issue.comments?.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900" data-testid={`text-comment-author-${comment.id}`}>
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500" data-testid={`text-comment-time-${comment.id}`}>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700" data-testid={`text-comment-content-${comment.id}`}>
                          {comment.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                          <Badge variant={comment.isInternal === "true" ? "secondary" : "default"}>
                            {comment.isInternal === "true" ? "Internal Note" : "Customer Visible"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
              Close
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="default" 
                className="bg-secondary hover:bg-green-700"
                onClick={handleMarkResolved}
                disabled={updateIssueMutation.isPending}
                data-testid="button-mark-resolved"
              >
                <i className="fas fa-check mr-2"></i>Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
