"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Flag,
  Shield,
  Users,
  Activity,
  TrendingUp,
  Image,
  Video,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ModerationItem {
  id: string;
  contentType: "post" | "comment";
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  status: "pending_review" | "approved" | "rejected";
  riskScore: number;
  flags: string[];
  reason: string;
  priority: "low" | "medium" | "high";
  queuedAt: string;
  reviewedAt?: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewerReason?: string;
  reviewerSuggestions?: string[];
}

interface ModerationStats {
  totalPending: number;
  totalReviewed: number;
  highRiskItems: number;
  avgResponseTime: number;
  topFlags: Array<{ flag: string; count: number }>;
}

export default function ModerationDashboard() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "reviewed" | "high_risk">(
    "pending",
  );
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewSuggestions, setReviewSuggestions] = useState("");

  useEffect(() => {
    fetchModerationItems();
    fetchModerationStats();
  }, [filter]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/moderation?filter=${filter}&limit=50`,
      );
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching moderation items:", error);
      toast.error("Failed to load moderation items");
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationStats = async () => {
    try {
      const response = await fetch("/api/admin/moderation/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
    }
  };

  const handleModerationAction = async (
    itemId: string,
    action: "approve" | "reject",
  ) => {
    try {
      const response = await fetch(`/api/admin/moderation/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: reviewReason,
          suggestions: reviewSuggestions.split("\n").filter((s) => s.trim()),
        }),
      });

      if (response.ok) {
        toast.success(`Content ${action}ed successfully`);
        fetchModerationItems();
        setSelectedItem(null);
        setReviewReason("");
        setReviewSuggestions("");
      } else {
        throw new Error("Failed to update moderation status");
      }
    } catch (error) {
      console.error("Error updating moderation status:", error);
      toast.error("Failed to update moderation status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 20) return "text-red-600 bg-red-100";
    if (score >= 10) return "text-orange-600 bg-orange-100";
    if (score >= 5) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFlag = (flag: string) => {
    return flag
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Content Moderation Dashboard
        </h1>
        <p className="text-gray-600">
          Child-Safe Content Review & Moderation System
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.totalPending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reviewed Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalReviewed}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Risk Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.highRiskItems}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.avgResponseTime}m
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as any)}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
          </TabsTrigger>
          <TabsTrigger value="high_risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            High Risk
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading moderation items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No items found for the selected filter</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`border-l-4 ${
                    item.priority === "high"
                      ? "border-l-red-500"
                      : item.priority === "medium"
                        ? "border-l-yellow-500"
                        : "border-l-green-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.contentType.charAt(0).toUpperCase() +
                              item.contentType.slice(1)}{" "}
                            by {item.user.firstName} {item.user.lastName}
                            <Badge
                              variant="outline"
                              className={getPriorityColor(item.priority)}
                            >
                              {item.priority} priority
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getRiskScoreColor(item.riskScore)}
                            >
                              Risk: {item.riskScore}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(item.queuedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.imageUrl && (
                          <Badge variant="secondary" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            Image
                          </Badge>
                        )}
                        {item.videoUrl && (
                          <Badge variant="secondary" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Content:</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                          {item.content}
                        </div>
                      </div>

                      {item.imageUrl && (
                        <div>
                          <h4 className="font-medium mb-2">Image:</h4>
                          <img
                            src={item.imageUrl}
                            alt="Content image"
                            className="max-w-xs max-h-32 object-cover rounded border"
                          />
                        </div>
                      )}

                      {item.flags.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Flags:</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.flags.map((flag) => (
                              <Badge
                                key={flag}
                                variant="destructive"
                                className="text-xs"
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {formatFlag(flag)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">AI Assessment:</h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                          {item.reason}
                        </p>
                      </div>

                      {item.status === "pending_review" && (
                        <div className="border-t pt-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">
                                Review Reason:
                              </label>
                              <Textarea
                                value={
                                  selectedItem?.id === item.id
                                    ? reviewReason
                                    : ""
                                }
                                onChange={(e) => {
                                  setSelectedItem(item);
                                  setReviewReason(e.target.value);
                                }}
                                placeholder="Explain your decision..."
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Suggestions for User (optional):
                              </label>
                              <Textarea
                                value={
                                  selectedItem?.id === item.id
                                    ? reviewSuggestions
                                    : ""
                                }
                                onChange={(e) => {
                                  setSelectedItem(item);
                                  setReviewSuggestions(e.target.value);
                                }}
                                placeholder="Helpful suggestions for the user..."
                                className="mt-1"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() =>
                                  handleModerationAction(item.id, "approve")
                                }
                                disabled={
                                  selectedItem?.id === item.id &&
                                  !reviewReason.trim()
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleModerationAction(item.id, "reject")
                                }
                                disabled={
                                  selectedItem?.id === item.id &&
                                  !reviewReason.trim()
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.reviewer && (
                        <div className="border-t pt-4">
                          <div className="text-sm text-gray-600">
                            <p>
                              <strong>Reviewed by:</strong>{" "}
                              {item.reviewer.firstName} {item.reviewer.lastName}
                            </p>
                            <p>
                              <strong>Review time:</strong>{" "}
                              {new Date(item.reviewedAt!).toLocaleString()}
                            </p>
                            {item.reviewerReason && (
                              <p>
                                <strong>Reason:</strong> {item.reviewerReason}
                              </p>
                            )}
                            {item.reviewerSuggestions &&
                              item.reviewerSuggestions.length > 0 && (
                                <div>
                                  <strong>Suggestions:</strong>
                                  <ul className="list-disc list-inside mt-1">
                                    {item.reviewerSuggestions.map(
                                      (suggestion, idx) => (
                                        <li key={idx}>{suggestion}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
