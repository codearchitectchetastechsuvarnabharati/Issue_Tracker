import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertIssueSchema, type Issue } from "@shared/schema";
import { z } from "zod";

const formSchema = insertIssueSchema.extend({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function CustomerInterface() {
  const [customerEmail, setCustomerEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      title: "",
      description: "",
      priority: "medium",
      status: "open",
    },
  });

  const { data: customerIssues = [] } = useQuery<Issue[]>({
    queryKey: ['/api/issues/customer', customerEmail],
    enabled: !!customerEmail,
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/issues', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues/customer'] });
      form.reset();
      setCustomerEmail(data.customerEmail);
      toast({
        title: "Issue submitted successfully!",
        description: "We'll get back to you soon.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit issue",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createIssueMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-secondary text-white';
      case 'in-progress': return 'bg-warning text-white';
      case 'open': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light text-gray-900 mb-4">Global Customer Support</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Submit your issue below and our worldwide support team will get back to you as soon as possible. 
          Your request will be handled by our expert team members.
        </p>
      </div>

      {/* Issue Submission Form */}
      <Card className="mb-8 shadow-material">
        <CardHeader>
          <CardTitle>Submit New Issue to Global Support</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-submit-issue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          data-testid="input-customer-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@company.com"
                          data-testid="input-customer-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief description of your issue"
                        data-testid="input-issue-title"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - General inquiry</SelectItem>
                        <SelectItem value="medium">Medium - Standard issue</SelectItem>
                        <SelectItem value="high">High - Affecting work</SelectItem>
                        <SelectItem value="urgent">Urgent - System down</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={6}
                        className="resize-vertical"
                        placeholder="Please provide as much detail as possible about the issue you're experiencing..."
                        data-testid="textarea-issue-description"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-6">
                <p className="text-sm text-gray-500">* Required fields</p>
                <Button 
                  type="submit" 
                  disabled={createIssueMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                  data-testid="button-submit-issue"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  {createIssueMutation.isPending ? "Submitting..." : "Submit Issue"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card className="shadow-material">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Recent Issues</CardTitle>
          {!customerEmail && (
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Enter your email to view issues"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-64"
                data-testid="input-customer-email-lookup"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {customerEmail ? (
            customerIssues.length > 0 ? (
              <div className="space-y-4">
                {customerIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    data-testid={`card-issue-${issue.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900" data-testid={`text-issue-title-${issue.id}`}>
                          {issue.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1" data-testid={`text-issue-description-${issue.id}`}>
                          {issue.description.length > 100 
                            ? `${issue.description.substring(0, 100)}...` 
                            : issue.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span data-testid={`text-issue-id-${issue.id}`}>
                            Ticket #{issue.id.slice(-8)}
                          </span>
                          <span data-testid={`text-issue-date-${issue.id}`}>
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        className={getStatusColor(issue.status)}
                        data-testid={`badge-status-${issue.id}`}
                      >
                        {issue.status === 'in-progress' ? 'In Progress' : 
                         issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="text-no-issues">
                <p className="text-gray-500">No issues found for this email address.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8" data-testid="text-enter-email">
              <p className="text-gray-500">Enter your email address above to view your issues.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
