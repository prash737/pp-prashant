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

        if (data.liked) {
          customToast({
            title: "Post liked!",
            description: "You liked this post.",
            type: "success",
          });
        } else {
          customToast({
            title: "Post unliked",
            description: "You removed your like from this post.",
            type: "info",
          });
        }
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

        if (data.reactionType) {
          customToast({
            title: "Reaction added!",
            description: `You reacted with ${reactionType}!`,
            type: "success",
          });
        } else if (data.liked === false || data.reactionType === null) {
          customToast({
            title: "Reaction removed",
            description: "You removed your reaction.",
            type: "info",
          });
        }
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
              onClick={() => {
                // Handle actual comments functionality - placeholder for now
                toast.info("Comments feature coming soon!");
              }}
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
    </Card>
  );
}