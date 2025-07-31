"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trophy,
  Code,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Trash2,
  Hash,
  Eye,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import CreatePost from "./create-post";
import EnhancedReactions from "./enhanced-reactions";
import { useCustomToast } from "@/hooks/use-custom-toast";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

interface PostWithTrailsProps {
  post: any;
  onPostUpdate: () => void;
  onRepost?: (postId: string, content?: string) => void;
}

const CHARACTER_LIMIT = 287;

// Initialize MarkdownIt with desired options
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable smartypants and other sweet transforms
});

// Function to format post content with Markdown and sanitize it
const formatContent = (content: string) => {
  try {
    const rendered = md.render(content);
    return DOMPurify.sanitize(rendered, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "ul",
        "ol",
        "li",
        "a",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  } catch (error) {
    console.error("Error formatting content:", error);
    return content;
  }
};

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

export default function PostWithTrails({
  post,
  onPostUpdate,
  onRepost,
}: PostWithTrailsProps) {
  console.log("🎬 PostWithTrails rendering:", {
    postId: post?.id?.substring(0, 8),
    hasAuthor: !!post?.author,
    authorName: post?.author?.firstName + " " + post?.author?.lastName,
    hasContent: !!post?.content,
    trailsCount: post?.trails?.length || 0,
  });
  const { user } = useAuth();
  const { customToast } = useCustomToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(
    post._count?.comments || 0,
  );
  const [bookmarksCount, setBookmarksCount] = useState(
    post._count?.bookmarks || 0,
  );
  const [showTrails, setShowTrails] = useState(false);
  const [showCreateTrail, setShowCreateTrail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [trails, setTrails] = useState(post.trails || []);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    {},
  );
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isVideoPost, setIsVideoPost] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  const PostTypeIcon =
    POST_TYPE_ICONS[post.postType as keyof typeof POST_TYPE_ICONS] ||
    MessageSquare;
  const postTypeColor =
    POST_TYPE_COLORS[post.postType as keyof typeof POST_TYPE_COLORS] ||
    "bg-blue-500";

  // Memoized formatted content
  const formattedContent = useMemo(
    () => formatContent(post.content),
    [post.content],
  );

  // Check if post contains video
  useEffect(() => {
    setIsVideoPost(post.imageUrl && /\.(mp4|webm|ogg)$/i.test(post.imageUrl));
  }, [post.imageUrl]);

  // Initialize states and fetch user's interaction status
  useEffect(() => {
    // Initialize from post data
    setIsLiked(post.isLikedByUser || false);
    setLikesCount(post.likesCount || post._count?.likes || 0);

    // Initialize reaction counts from likes count
    setReactionCounts((prev) => ({
      ...prev,
      like: post.likesCount || post._count?.likes || 0,
    }));

    if (post.isLikedByUser) {
      setUserReaction("like");
    }

    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/feed/posts/${post.id}/bookmark`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };

    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/feed/posts/${post.id}/react`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.reactionCounts) {
            setReactionCounts(data.reactionCounts);
            setUserReaction(data.userReaction || null);
          }
        }
      } catch (error) {
        console.error("Error fetching reactions:", error);
      }
    };

    if (user) {
      checkBookmarkStatus();
      fetchReactions();
    }
  }, [post.id, post.isLikedByUser, post.likesCount, post._count?.likes, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likeCount || data.likesCount);

        // Remove like/unlike toasts for better UX - likes should be instant without notifications
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/bookmark`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
        setBookmarksCount(data.bookmarksCount);

        if (data.isBookmarked) {
          customToast({
            title: "Post saved!",
            description: "Post added to your bookmarks.",
            type: "success",
          });
        } else {
          customToast({
            title: "Post removed from bookmarks",
            description: "Post removed from your saved items.",
            type: "info",
          });
        }
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error("Failed to bookmark post");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `${post.author?.firstName} ${post.author?.lastName}'s post`,
      text:
        post.content.substring(0, 100) +
        (post.content.length > 100 ? "..." : ""),
      url: shareUrl,
    };

    try {
      // Try native share API first (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        customToast({
          title: "Post shared!",
          description: "The post has been shared successfully.",
          type: "success",
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        customToast({
          title: "Link copied!",
          description: "Post link has been copied to your clipboard.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      // Final fallback - show share dialog with link
      const shareText = `Check out this post: ${shareUrl}`;
      try {
        await navigator.clipboard.writeText(shareText);
        customToast({
          title: "Link copied!",
          description: "Post link has been copied to your clipboard.",
          type: "success",
        });
      } catch (clipboardError) {
        customToast({
          title: "Share",
          description: `Copy this link: ${shareUrl}`,
          type: "info",
        });
      }
    }
  };

  const handleRepost = () => {
    if (onRepost) {
      onRepost(post.id);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        customToast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
          type: "success",
        });
        onPostUpdate();
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const toggleTrails = async () => {
    if (!showTrails) {
      // Fetch trails when showing them
      try {
        const response = await fetch(`/api/feed/posts/${post.id}/trails`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setTrails(data.trails || []);
        }
      } catch (error) {
        console.error("Error fetching trails:", error);
      }
    }
    setShowTrails(!showTrails);
  };

  const handleTrailCreated = async () => {
    // Refetch trails and update UI
    try {
      console.log("🔄 Refetching trails for post:", post.id);
      const response = await fetch(`/api/feed/posts/${post.id}/trails`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched trails:", data.trails?.length || 0);
        setTrails(data.trails || []);
        setCommentsCount((prev) => prev + 1);

        // Show success feedback
        customToast({
          title: "Trail added!",
          description: "Your message has been added to the trail discussion.",
          type: "success",
        });

        // Auto-expand trails section if not already visible
        if (!showTrails) {
          setShowTrails(true);
        }
      } else {
        console.error("❌ Failed to fetch trails:", response.status);
        toast.error("Failed to refresh trail discussion");
      }
    } catch (error) {
      console.error("Error fetching trails:", error);
      toast.error("Failed to refresh trail discussion");
    }

    // Close the create trail form
    setShowCreateTrail(false);
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const fetchComments = async () => {
    if (commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/feed/posts/${post.id}/comment`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
        
        customToast({
          title: "Comment added!",
          description: "Your comment has been posted successfully.",
          type: "success",
        });
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShowComments = () => {
    setShowComments(true);
    if (comments.length === 0) {
      fetchComments();
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error("Please log in to react to posts");
      return;
    }

    // Optimistic update for immediate feedback
    const wasCurrentReaction = userReaction === reactionType
    const newReaction = wasCurrentReaction ? null : reactionType
    const previousReaction = userReaction
    const previousCounts = { ...reactionCounts }
    const previousLikeCount = likesCount
    const previousIsLiked = isLiked

    // Update UI immediately
    setUserReaction(newReaction)

    if (reactionType === 'like') {
      const newLiked = !wasCurrentReaction
      setIsLiked(newLiked)
      setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))
    }

    // Update reaction counts optimistically
    const newCounts = { ...reactionCounts }
    if (wasCurrentReaction) {
      // Removing reaction
      newCounts[reactionType] = Math.max(0, (newCounts[reactionType] || 0) - 1)
    } else {
      // Adding reaction (remove from previous if exists)
      if (previousReaction && previousReaction !== reactionType) {
        newCounts[previousReaction] = Math.max(0, (newCounts[previousReaction] || 0) - 1)
      }
      newCounts[reactionType] = (newCounts[reactionType] || 0) + 1
    }
    setReactionCounts(newCounts)

    try {
      const response = await fetch(`/api/feed/posts/${post.id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reactionType }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update reaction counts if available
        if (data.reactionCounts) {
          setReactionCounts(data.reactionCounts);
          setUserReaction(data.userReaction);
        } else {
          // Fallback for simple like system
          if (reactionType === "like") {
            setIsLiked(data.liked);
            setLikesCount(data.likeCount || data.likesCount);
            setUserReaction(data.liked ? "like" : null);

            // Update reaction counts for consistency
            setReactionCounts((prev) => ({
              ...prev,
              like: data.likeCount || data.likesCount || 0,
            }));
          }
        }

        // Remove reaction toasts for better UX - reactions should be instant without notifications
      }
    } catch (error) {
      // Revert optimistic updates on error
      setUserReaction(previousReaction)
      setReactionCounts(previousCounts)
      if (reactionType === 'like') {
        setIsLiked(previousIsLiked)
        setLikesCount(previousLikeCount)
      }

      console.error("Error reacting to post:", error);
      toast.error("Failed to react to post");
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={
                  post.author?.profileImageUrl || "/images/default-profile.png"
                }
                alt={`${post.author?.firstName} ${post.author?.lastName}`}
                width={48}
                height={48}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/default-profile.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {post.author?.firstName} {post.author?.lastName}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {post.author?.role}
                </Badge>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full ${postTypeColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <PostTypeIcon className="h-3 w-3 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {post.postType.toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <time>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </time>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.viewsCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          {user?.id === post.author?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div
          className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap break-words leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Achievement Type */}
        {post.isAchievement && post.achievementType && (
          <div className="mb-4">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              <Trophy className="h-3 w-3 mr-1" />
              {post.achievementType}
            </Badge>
          </div>
        )}

        {/* Project Category */}
        {post.projectCategory && (
          <div className="mb-4">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <Code className="h-3 w-3 mr-1" />
              {post.projectCategory}
            </Badge>
          </div>
        )}

        {/* Difficulty Level */}
        {post.difficultyLevel && (
          <div className="mb-4">
            <Badge variant="outline" className="capitalize">
              {post.difficultyLevel}
            </Badge>
          </div>
        )}

        {/* Media */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {isVideoPost ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={post.imageUrl}
                  className="w-full max-h-96 object-cover"
                  muted={isVideoMuted}
                  loop
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleVideoToggle}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleVideoMuteToggle}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isVideoMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={600}
                height={400}
                className="w-full max-h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        )}

        {/* Link Preview */}
        {post.linkPreview && (
          <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex gap-3">
              {post.linkPreview.image && (
                <img
                  src={post.linkPreview.image}
                  alt="Link preview"
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {post.linkPreview.title}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {post.linkPreview.description}
                </div>
                <div className="text-xs text-blue-600 truncate">
                  {post.linkPreview.url}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <EnhancedReactions
              postId={post.id}
              initialLikes={likesCount}
              isLiked={isLiked}
              reactionCounts={reactionCounts}
              userReaction={userReaction}
              onReact={handleReaction}
              size="sm"
              onReactionChange={(reactionType) => {
                setUserReaction(reactionType);
                if (reactionType) {
                  setIsLiked(reactionType === "like");
                }
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowComments}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{commentsCount} Comments</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTrails}
              className={`flex items-center gap-2 transition-colors ${showTrails ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="font-medium">{trails.length} Trails</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="font-medium">Share</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`transition-colors ${isBookmarked ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        {/* Engagement Score */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <TrendingUp className="h-3 w-3" />
          <span>Engagement Score: {post.engagementScore || 0}</span>
        </div>

        {/* Trails Section */}
        {showTrails && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Trail Discussion ({trails.length} {trails.length === 1 ? 'trail' : 'trails'})
              </h4>
            </div>

            {/* Trail Messages */}
            <div className="space-y-3">
              {trails.map((trail: any) => (
                <div
                  key={trail.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        trail.author?.profileImageUrl ||
                        "/images/default-profile.png"
                      }
                      alt={`${trail.author?.firstName} ${trail.author?.lastName}`}
                      width={32}
                      height={32}
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-profile.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {trail.author?.firstName} {trail.author?.lastName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        #{trail.trailOrder}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(trail.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div
                      className="text-sm text-gray-700 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: formatContent(trail.content),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {trails.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <p>
                  No trails yet. Be the first to add to this trail discussion!
                </p>
              </div>
            )}

            {/* Add Trail Button - Positioned after all trails */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateTrail(!showCreateTrail)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    showCreateTrail 
                      ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800" 
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <span className="font-medium">
                    {showCreateTrail ? "Cancel Trail" : "Add Trail"}
                  </span>
                </Button>

                {/* Create Trail Form - Positioned after Add Trail button */}
                {showCreateTrail && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-purple-800 mb-1">
                        Add to Trail Discussion
                      </h4>
                      <p className="text-xs text-purple-600">
                        Continue the conversation with your thoughts, questions, or additional insights.
                      </p>
                    </div>
                    <CreatePost
                      parentPostId={post.id}
                      isTrail={true}
                      onPostCreated={handleTrailCreated}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Section - Better integrated and styled */}
      {showComments && (
        <CardContent className="pt-6 border-t border-gray-100 mt-4">
          {/* Comments Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Comments ({commentsCount})
                </h4>
                <p className="text-sm text-gray-500">Join the discussion</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              ✕
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Loading comments...</span>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                </div>
                <h5 className="font-medium text-gray-700 mb-1">No comments yet</h5>
                <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                        {(comment.author?.profileImageUrl || comment.user?.profileImageUrl) ? (
                          <img
                            src={comment.author?.profileImageUrl || comment.user?.profileImageUrl}
                            alt={`${comment.author?.firstName || comment.user?.firstName} ${comment.author?.lastName || comment.user?.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/images/default-profile.png";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {(comment.author?.firstName || comment.user?.firstName || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Comment Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.author?.firstName || comment.user?.firstName} {comment.author?.lastName || comment.user?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {/* Comment Text */}
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          {user ? (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={user.user_metadata?.avatar_url || "/images/default-profile.png"}
                      alt="Your profile"
                      width={36}
                      height={36}
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-profile.png";
                      }}
                    />
                  </div>
                </div>

                {/* Comment Input */}
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a thoughtful comment..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      rows={2}
                      maxLength={500}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {newComment.length}/500 • Press Ctrl+Enter to submit
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewComment('')}
                        disabled={!newComment.trim()}
                        className="text-gray-500 hover:text-gray-700 h-8 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || newComment.length > 500}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-4">
              <div className="text-center py-6 bg-blue-50 rounded-lg border border-blue-100">
                <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h5 className="font-medium text-gray-800 mb-1">Join the conversation</h5>
                <p className="text-sm text-gray-600 mb-3">Sign in to leave a comment and engage with the community.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 h-8 px-4 text-xs"
                >
                  Sign In to Comment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}