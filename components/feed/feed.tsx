"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreatePost from "./create-post";
import PostWithTrails from "./post-with-trails";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Trophy,
  Code,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  Filter,
  SortDesc,
  Hash,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EnhancedReactions from "./enhanced-reactions";
import { useCustomToast } from "@/hooks/use-custom-toast";
import EnhancedFeedItem from "./enhanced-feed-item";
import MarkdownIt from "markdown-it";

// Custom hook for DOMPurify
const useDOMPurify = () => {
  const [DOMPurify, setDOMPurify] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("isomorphic-dompurify").then((module) => {
        setDOMPurify(module.default);
      });
    }
  }, []);

  return DOMPurify;
};

interface FeedPost {
  id: string;
  content: string;
  imageUrl?: string;
  postType: string;
  tags: string[];
  subjects: string[];
  isQuestion: boolean;
  isAchievement: boolean;
  achievementType?: string;
  projectCategory?: string;
  difficultyLevel?: string;
  engagementScore: number;
  viewsCount: number;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
  };
  trails: TrailMessage[];
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  likesCount?: number;
  isLikedByUser?: boolean;
}

interface TrailMessage {
  id: string;
  content: string;
  order: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
  };
  createdAt: string;
}

const POST_TYPE_ICONS = {
  GENERAL: MessageSquare,
  ACHIEVEMENT: Trophy,
  PROJECT: Code,
  QUESTION: HelpCircle,
  DISCUSSION: MessageSquare,
  TUTORIAL: BookOpen,
  RESOURCE_SHARE: Share2,
  EVENT_ANNOUNCEMENT: Calendar,
};

const POST_TYPE_COLORS = {
  GENERAL: "bg-blue-500",
  ACHIEVEMENT: "bg-yellow-500",
  PROJECT: "bg-green-500",
  QUESTION: "bg-purple-500",
  DISCUSSION: "bg-indigo-500",
  TUTORIAL: "bg-orange-500",
  RESOURCE_SHARE: "bg-teal-500",
  EVENT_ANNOUNCEMENT: "bg-red-500",
};

// Function to format post content with Markdown and sanitize it
const formatPostContent = (content: string, DOMPurify: any): string => {
  if (!content) return "";

  try {
    // Initialize markdown parser
    const md = new MarkdownIt({
      html: false, // Disable HTML for security
      breaks: true,
      linkify: true,
      typographer: true,
    });

    // Render markdown to HTML
    const html = md.render(content);

    // Sanitize the HTML if DOMPurify is available
    if (DOMPurify && typeof window !== "undefined") {
      const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "a",
          "ul",
          "ol",
          "li",
          "blockquote",
          "code",
          "pre",
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
      });
      return cleanHtml;
    }

    // If DOMPurify is not available, return the markdown-rendered HTML
    // This is safe because we disabled HTML in markdown options
    return html;
  } catch (error) {
    console.error("Error formatting post content:", error);
    return content; // Return original content as fallback
  }
};

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const { user } = useAuth();
  const DOMPurify = useDOMPurify();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    type: "post" | "trail";
    trailOrder?: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postLikeCounts, setPostLikeCounts] = useState<Record<string, number>>(
    {},
  );
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const handleLike = async (
    postId: string,
    currentLikeCount: number,
    isLiked: boolean,
  ) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();

      // Update the posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: data.liked
                  ? currentLikeCount + 1
                  : Math.max(0, currentLikeCount - 1),
                isLikedByUser: data.liked,
                _count: {
                  ...post._count,
                  likes: data.liked
                    ? currentLikeCount + 1
                    : Math.max(0, currentLikeCount - 1),
                },
              }
            : post,
        ),
      );

      toast.success(data.liked ? "Post liked!" : "Post unliked!");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleReactionChange = (
    postId: string,
    reactionType: string | null,
  ) => {
    // Update the posts state when reaction changes
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByUser: reactionType === "like",
              likesCount: reactionType
                ? (post.likesCount || 0) + (post.isLikedByUser ? 0 : 1)
                : Math.max(0, (post.likesCount || 0) - 1),
              _count: {
                ...post._count,
                likes: reactionType
                  ? (post.likesCount || 0) + (post.isLikedByUser ? 0 : 1)
                  : Math.max(0, (post.likesCount || 0) - 1),
              },
            }
          : post,
      ),
    );
  };

  useEffect(() => {
    fetchPosts();
  }, [filter, postTypeFilter, subjectFilter, difficultyFilter]);

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/posts/${postId}/bookmark`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Post bookmarked!");
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error("Failed to bookmark post");
    }
  };

  const handleRepost = async (postId: string, content?: string) => {
    if (!user) {
      toast.error("Please login to repost");
      return;
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/repost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: content || "" }),
      });

      if (response.ok) {
        toast.success("Post reposted successfully!");
        fetchPosts(); // Refresh the feed
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to repost");
      }
    } catch (error) {
      console.error("Error reposting:", error);
      toast.error("Failed to repost");
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleDeleteClick = (
    id: string,
    type: "post" | "trail",
    trailOrder?: number,
  ) => {
    setDeletingItem({ id, type, trailOrder });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem || !user) {
      console.error("Delete confirmation failed: missing deletingItem or user");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/feed/posts/${deletingItem.id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Use cookies for authentication
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${deletingItem.type}`);
      }

      if (deletingItem.type === "post") {
        toast.success("Post deleted successfully");
      } else {
        toast.success("Trail message deleted successfully");
      }

      fetchPosts(); // Refresh the feed
    } catch (error) {
      console.error("Error deleting:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to delete ${deletingItem.type}`;
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletingItem(null);
    }
  };

  const canDelete = (authorId: string) => {
    return user && user.id === authorId;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filter,
        ...(postTypeFilter !== "all" && { type: postTypeFilter }),
        ...(subjectFilter !== "all" && { subject: subjectFilter }),
        ...(difficultyFilter !== "all" && { difficulty: difficultyFilter }),
      });

      const response = await fetch(`/api/feed/posts?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Feed data received:", {
        postsCount: data.posts?.length || 0,
        firstPost: data.posts?.[0]
          ? {
              id: data.posts[0].id?.substring(0, 8),
              author:
                data.posts[0].author?.firstName +
                " " +
                data.posts[0].author?.lastName,
              content: data.posts[0].content?.substring(0, 50) + "...",
            }
          : "No posts",
      });

      const validPosts = (data.posts || []).filter((post: any) => {
        const isValid = post && post.id && post.author && post.content;
        if (!isValid) {
          console.warn("⚠️ Invalid post filtered out:", {
            hasId: !!post?.id,
            hasAuthor: !!post?.author,
            hasContent: !!post?.content,
          });
        }
        return isValid;
      });

      console.log(`✅ Setting ${validPosts.length} valid posts in state`);
      setPosts(validPosts);
      setHasMore(data.hasMore || false);

      // Initialize like states
      if (validPosts.length > 0) {
        const likeCounts: Record<string, number> = {};
        const userLikes = new Set<string>();

        validPosts.forEach((post: any) => {
          likeCounts[post.id] = post.likesCount || post._count?.likes || 0;
          if (post.isLikedByUser) {
            userLikes.add(post.id);
          }
        });

        setPostLikeCounts(likeCounts);
        setLikedPosts(userLikes);
      }
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="transform transition-all duration-300 hover:scale-[1.01]">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      {/* Feed Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pathpiper-teal data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Code className="h-4 w-4 mr-1" />
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Questions
              </TabsTrigger>
            </TabsList>

            {/* Advanced Filters */}
            <div className="flex gap-3 flex-wrap">
              <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                <SelectTrigger className="w-[140px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-md">
                  <Filter className="h-4 w-4 mr-1 text-pathpiper-teal" />
                  <SelectValue placeholder="Post Type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="QUESTION">Question</SelectItem>
                  <SelectItem value="DISCUSSION">Discussion</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                </SelectContent>
              </Select>

              {availableSubjects.length > 0 && (
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[120px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-md">
                    <Hash className="h-4 w-4 mr-1 text-blue-500" />
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-[120px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-md">
                  <SortDesc className="h-4 w-4 mr-1 text-purple-500" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pathpiper-teal/20 border-t-pathpiper-teal mx-auto"></div>
              <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-4 border-pathpiper-teal/10 mx-auto"></div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Loading amazing posts...
              </p>
              <div className="flex justify-center space-x-1">
                <div className="h-2 w-2 bg-pathpiper-teal rounded-full animate-bounce"></div>
                <div
                  className="h-2 w-2 bg-pathpiper-teal rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-2 w-2 bg-pathpiper-teal rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pathpiper-teal to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to share something amazing with the community!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pathpiper-teal to-blue-500 text-white rounded-full text-sm font-medium shadow-md">
                <span className="animate-pulse">✨ Start the conversation</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {console.log("🎨 Rendering posts:", posts.length)}
            {posts.map((post, index) => {
              console.log(`🎨 Rendering post ${index + 1}:`, {
                id: post.id?.substring(0, 8),
                author: post.author?.firstName + " " + post.author?.lastName,
                hasContent: !!post.content,
                contentLength: post.content?.length,
              });
              return (
                <div
                  key={post.id}
                  className="transform transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  <PostWithTrails
                    post={post}
                    onPostUpdate={fetchPosts}
                    onRepost={handleRepost}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowDeleteDialog(open);
            if (!open) {
              setDeletingItem(null);
            }
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {deletingItem?.type === "post"
                ? "Are you sure you want to delete this post? This will permanently remove the post and all its trail messages. This action cannot be undone."
                : "Are you sure you want to delete this trail message? This will permanently remove the message and reorder the remaining trails. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {deletingItem?.type === "post" ? "Post" : "Trail"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
