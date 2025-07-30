"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ImageIcon,
  Video,
  Link,
  Smile,
  MapPin,
  Plus,
  Trophy,
  Code,
  HelpCircle,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Share2,
  Calendar,
  Hash,
  X,
  Bold,
  Italic,
  List,
  Link2,
  Type,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import ModerationHelper from "./moderation-helper";

interface CreatePostProps {
  parentPostId?: string;
  isTrail?: boolean;
  onPostCreated?: () => void;
}

interface TrailDraft {
  id: string;
  content: string;
  imageUrl?: string;
}

const POST_TYPES = [
  {
    value: "GENERAL",
    label: "General Post",
    icon: MessageSquare,
    color: "bg-blue-500",
  },
  {
    value: "ACHIEVEMENT",
    label: "Achievement",
    icon: Trophy,
    color: "bg-yellow-500",
  },
  { value: "PROJECT", label: "Project", icon: Code, color: "bg-green-500" },
  {
    value: "QUESTION",
    label: "Question",
    icon: HelpCircle,
    color: "bg-purple-500",
  },
  {
    value: "DISCUSSION",
    label: "Discussion",
    icon: MessageSquare,
    color: "bg-indigo-500",
  },
  {
    value: "TUTORIAL",
    label: "Tutorial",
    icon: BookOpen,
    color: "bg-orange-500",
  },
  {
    value: "RESOURCE_SHARE",
    label: "Resource",
    icon: Share2,
    color: "bg-teal-500",
  },
  {
    value: "EVENT_ANNOUNCEMENT",
    label: "Event",
    icon: Calendar,
    color: "bg-red-500",
  },
];

const ACHIEVEMENT_TYPES = [
  "Academic Excellence",
  "Competition Win",
  "Project Completion",
  "Skill Mastery",
  "Leadership",
  "Community Service",
  "Research",
  "Innovation",
  "Sports",
  "Arts",
];

const PROJECT_CATEGORIES = [
  "Web Development",
  "Mobile App",
  "Data Science",
  "AI/ML",
  "IoT",
  "Robotics",
  "Game Development",
  "Research",
  "Art Project",
  "Science Experiment",
  "Other",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "💭",
  "💫",
  "⭐",
  "🌟",
  "✨",
  "🔥",
  "💯",
  "💢",
  "💥",
  "💨",
  "🎉",
  "🎊",
  "🎈",
  "🎂",
  "🎀",
  "🎁",
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "🖕",
  "👇",
  "☝️",
  "👋",
  "🤚",
  "🖐️",
  "✋",
  "🖖",
  "👏",
  "🙌",
  "🤝",
  "🙏",
  "✍️",
  "💪",
  "🦾",
  "🦿",
  "🦵",
  "🦶",
  "👂",
  "🦻",
  "👃",
  "🧠",
  "🫀",
  "🫁",
  "🦷",
  "🦴",
  "👀",
  "👁️",
  "👅",
];

const CHARACTER_LIMIT = 287;

export default function CreatePost({
  parentPostId,
  isTrail = false,
  onPostCreated,
}: CreatePostProps) {
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postType, setPostType] = useState("GENERAL");
  const [tags, setTags] = useState<string[]>([]);
  const [achievementType, setAchievementType] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [visibility, setVisibility] = useState("public");
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [trailContext, setTrailContext] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [richTextMode, setRichTextMode] = useState(false);
  const [trails, setTrails] = useState<TrailDraft[]>([]);
  const [showAddTrail, setShowAddTrail] = useState(false);
  const [trailContent, setTrailContent] = useState("");
  const [trailImageUrl, setTrailImageUrl] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [showModerationHelper, setShowModerationHelper] = useState(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const selectedPostType = POST_TYPES.find((type) => type.value === postType);

  // Fetch connections for @ mentions
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/connections");
        if (response.ok) {
          const data = await response.json();
          setConnections(data);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, []);

  // Fetch trail context when creating a trail
  useEffect(() => {
    if (isTrail && parentPostId) {
      const fetchTrailContext = async () => {
        try {
          const response = await fetch(`/api/feed/posts/${parentPostId}`);
          if (response.ok) {
            const data = await response.json();
            setTrailContext(data);
          }
        } catch (error) {
          console.error("Error fetching trail context:", error);
        }
      };

      fetchTrailContext();
    }
  }, [isTrail, parentPostId]);

  // Auto-generate link preview
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = postText.match(urlRegex);

    if (urls && urls.length > 0 && !isLoadingPreview) {
      const firstUrl = urls[0];
      if (linkPreview?.url !== firstUrl) {
        setIsLoadingPreview(true);
        fetchLinkPreview(firstUrl);
      }
    } else if (!urls && linkPreview) {
      setLinkPreview(null);
    }
  }, [postText]);

  const fetchLinkPreview = async (url: string) => {
    try {
      // Simple preview generation - in a real app, you'd use a service like Unfurl or implement server-side scraping
      const response = await fetch(
        `/api/link-preview?url=${encodeURIComponent(url)}`,
      );
      if (response.ok) {
        const preview = await response.json();
        setLinkPreview({ url, ...preview });
      } else {
        // Fallback - create a basic preview
        setLinkPreview({
          url,
          title: url,
          description: "Link preview",
          image: null,
        });
      }
    } catch (error) {
      console.error("Error fetching link preview:", error);
      setLinkPreview({
        url,
        title: url,
        description: "Link preview",
        image: null,
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Function to get actual character count excluding markdown syntax
  const getActualCharacterCount = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
      .replace(/\[(.*?)\]\(.*?\)/g, "$1").length; // Remove link markdown, keep text
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;

    // Check actual character count (excluding markdown syntax)
    const actualCount = getActualCharacterCount(value);
    if (actualCount > CHARACTER_LIMIT) {
      return;
    }

    setPostText(value);
    setCursorPosition(position);
    setHasUnsavedChanges(true);

    // Extract hashtags from content - trigger on space or end of input
    const hashtagRegex = /#(\w+)/g;
    const extractedHashtags = [...value.matchAll(hashtagRegex)].map(
      (match) => match[1],
    );

    // Update tags with extracted hashtags, only keeping valid ones
    setTags(extractedHashtags);

    // Check for @ mentions
    const textUpToCursor = value.substring(0, position);
    const lastAtIndex = textUpToCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textUpToCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (connection: any) => {
    const textUpToCursor = postText.substring(0, cursorPosition);
    const textAfterCursor = postText.substring(cursorPosition);
    const lastAtIndex = textUpToCursor.lastIndexOf("@");

    const beforeAt = postText.substring(0, lastAtIndex);
    const mention = `@${connection.user.firstName} ${connection.user.lastName}`;
    const newText = beforeAt + mention + " " + textAfterCursor;

    setPostText(newText);
    setShowMentions(false);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = beforeAt.length + mention.length + 1;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textUpToCursor = postText.substring(0, cursorPosition);
    const textAfterCursor = postText.substring(cursorPosition);
    const newText = textUpToCursor + emoji + textAfterCursor;

    if (newText.length <= CHARACTER_LIMIT) {
      setPostText(newText);
      setHasUnsavedChanges(true);
      setShowEmojiPicker(false);

      setTimeout(() => {
        textareaRef.current?.focus();
        const newPosition = cursorPosition + emoji.length;
        textareaRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const applyRichTextFormat = (format: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = postText.substring(start, end);

    if (selectedText) {
      let formattedText = "";
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          break;
        case "link":
          const url = prompt("Enter URL:");
          if (url) {
            formattedText = `[${selectedText}](${url})`;
          } else {
            return;
          }
          break;
        default:
          return;
      }

      const newText =
        postText.substring(0, start) + formattedText + postText.substring(end);
      if (newText.length <= CHARACTER_LIMIT) {
        setPostText(newText);
        setHasUnsavedChanges(true);
      }
    }
  };

  const insertList = () => {
    const textUpToCursor = postText.substring(0, cursorPosition);
    const textAfterCursor = postText.substring(cursorPosition);
    const listItem = "\n• ";
    const newText = textUpToCursor + listItem + textAfterCursor;

    if (newText.length <= CHARACTER_LIMIT) {
      setPostText(newText);
      setHasUnsavedChanges(true);

      setTimeout(() => {
        textareaRef.current?.focus();
        const newPosition = cursorPosition + listItem.length;
        textareaRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const filteredConnections = connections.filter(
    (conn) =>
      mentionSearch === "" ||
      conn.user.firstName.toLowerCase().includes(mentionSearch) ||
      conn.user.lastName.toLowerCase().includes(mentionSearch),
  );

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  const addTrail = () => {
    if (!trailContent.trim()) {
      toast.error("Please write something for the trail");
      return;
    }

    const newTrail: TrailDraft = {
      id: Date.now().toString(),
      content: trailContent.trim(),
      imageUrl: trailImageUrl || undefined,
    };

    setTrails([...trails, newTrail]);
    setTrailContent("");
    setTrailImageUrl(null);
    setShowAddTrail(false);
    setIsDraft(true);
    setHasUnsavedChanges(true);
    toast.success("Trail added to draft!");
  };

  const removeTrail = (trailId: string) => {
    setTrails(trails.filter((trail) => trail.id !== trailId));
    if (trails.length === 1) {
      setIsDraft(false);
    }
    setHasUnsavedChanges(true);
  };

  const saveDraft = () => {
    const draftData = {
      mainPost: {
        content: postText,
        imageUrl,
        postType,
        tags,
        achievementType,
        projectCategory,
        difficultyLevel,
        visibility,
        linkPreview,
      },
      trails,
      timestamp: Date.now(),
    };

    localStorage.setItem("postDraft", JSON.stringify(draftData));
    setIsDraft(false);
    setHasUnsavedChanges(false);
    toast.success("Draft saved!");
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem("postDraft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setPostText(draftData.mainPost.content || "");
        setImageUrl(draftData.mainPost.imageUrl || null);
        setPostType(draftData.mainPost.postType || "GENERAL");
        setTags(draftData.mainPost.tags || []);
        setAchievementType(draftData.mainPost.achievementType || "");
        setProjectCategory(draftData.mainPost.projectCategory || "");
        setDifficultyLevel(draftData.mainPost.difficultyLevel || "");
        setVisibility(draftData.mainPost.visibility || "public");
        setLinkPreview(draftData.mainPost.linkPreview || null);
        setTrails(draftData.trails || []);
        setIsDraft(true);
        setHasUnsavedChanges(true);
        toast.success("Draft loaded!");
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Failed to load draft");
      }
    } else {
      toast.error("No draft found");
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("postDraft");
    setPostText("");
    setTags([]);
    setAchievementType("");
    setProjectCategory("");
    setDifficultyLevel("");
    setPostType("GENERAL");
    setVisibility("public");
    setImageUrl(null);
    setLinkPreview(null);
    setTrails([]);
    setIsDraft(false);
    setHasUnsavedChanges(false);
    toast.success("Draft cleared!");
  };

  const handlePost = async () => {
    if (!postText.trim()) {
      toast.error("Please write something to post");
      return;
    }

    if (postText.length > CHARACTER_LIMIT) {
      toast.error(
        `Content exceeds ${CHARACTER_LIMIT} characters. Please shorten your content.`,
      );
      return;
    }

    // Pre-moderation check
    try {
      const moderationResponse = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postText,
          type: "post",
          userId: user?.id,
          imageUrl: imageUrl,
        }),
      });

      const moderationResult = await moderationResponse.json();
      setModerationResult(moderationResult);

      if (moderationResult.moderation.status === "rejected") {
        toast.error(
          "Content violates community guidelines and cannot be posted",
        );
        setShowModerationHelper(true);
        return;
      } else if (moderationResult.moderation.status === "pending_review") {
        toast.warning(
          "Content requires review and will be posted after approval",
        );
      } else if (moderationResult.moderation.status === "flagged") {
        if (moderationResult.moderation.suggestions?.length > 0) {
          toast.warning(
            `Content flagged: ${moderationResult.moderation.suggestions[0]}`,
          );
          setShowModerationHelper(true);
          return;
        }
      }
    } catch (error) {
      console.error("Moderation check failed:", error);
      // Continue with posting if moderation service fails
    }

    setIsPosting(true);
    try {
      // First create the main post
      const response = await fetch("/api/feed/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postText,
          parentPostId: parentPostId || undefined,
          postType: isTrail ? "GENERAL" : postType,
          tags: isTrail ? [] : tags,
          achievementType: isTrail ? undefined : achievementType || undefined,
          projectCategory: isTrail ? undefined : projectCategory || undefined,
          difficultyLevel: isTrail ? undefined : difficultyLevel || undefined,
          visibility: isTrail ? "public" : visibility,
          isTrail,
          imageUrl: imageUrl,
          linkPreview: linkPreview,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const createdPostId = data.post.id;

        // If there are trails, create them one by one
        if (trails.length > 0 && !isTrail) {
          for (let i = 0; i < trails.length; i++) {
            const trail = trails[i];
            try {
              await fetch(`/api/feed/posts/${createdPostId}/trails`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: trail.content,
                  imageUrl: trail.imageUrl || null,
                }),
              });
            } catch (trailError) {
              console.error(`Error creating trail ${i + 1}:`, trailError);
              toast.error(`Failed to create trail ${i + 1}`);
            }
          }
        }

        // Clear form and draft
        setPostText("");
        setTags([]);
        setAchievementType("");
        setProjectCategory("");
        setDifficultyLevel("");
        setPostType("GENERAL");
        setVisibility("public");
        setImageUrl(null);
        setLinkPreview(null);
        setTrails([]);
        setIsDraft(false);
        setHasUnsavedChanges(false);

        // Clear saved draft
        localStorage.removeItem("postDraft");

        const successMessage =
          trails.length > 0
            ? `Post with ${trails.length} trail(s) created successfully!`
            : isTrail
              ? "Trail added successfully!"
              : "Post created successfully!";

        toast.success(successMessage);
        onPostCreated?.();
      } else {
        toast.error(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast.error("Image size must be less than 1MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file, file.name);

    try {
      const response = await fetch("/api/upload/feed-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleTrailImageUpload = async (file: File) => {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast.error("Image size must be less than 1MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file, file.name);

    try {
      const response = await fetch("/api/upload/feed-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setTrailImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Error uploading trail image:", error);
      toast.error("Failed to upload trail image");
    }
  };

  const characterCount = getActualCharacterCount(postText);
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  // Check for saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("postDraft");
    if (savedDraft && !isTrail) {
      try {
        const draftData = JSON.parse(savedDraft);
        setIsDraft(true);
      } catch (error) {
        console.error("Error checking draft:", error);
      }
    }
  }, [isTrail]);

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Compact Create Post Component
  const CompactCreatePost = () => (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.profileImageUrl || "/images/default-profile.png"}
              alt="Your profile"
              width={40}
              height={40}
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/default-profile.png";
              }}
            />
          </div>
          <div className="flex-1">
            <button
              onClick={() => setShowOverlay(true)}
              type="button"
              className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pathpiper-teal"
            >
              <span className="text-gray-500">What's on your mind?</span>
            </button>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="text-gray-600 hover:text-pathpiper-teal"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="text-gray-600 hover:text-pathpiper-teal"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Achievement
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverlay(true)}
                className="text-gray-600 hover:text-pathpiper-teal"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Question
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Full Create Post Overlay Component
  const FullCreatePostOverlay = () => (
    <Dialog 
      open={showOverlay} 
      onOpenChange={setShowOverlay}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type and Visibility Selection */}
          <div className="flex gap-3 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap items-center">
              {/* Quick Access Buttons */}
              {POST_TYPES.slice(0, 2).map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={
                      postType === type.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setPostType(type.value)}
                    className={`${postType === type.value ? type.color + " text-white" : ""}`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </Button>
                );
              })}

              {/* All Post Types Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    More Types
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {POST_TYPES.slice(2).map((type) => {
                    const Icon = type.icon;
                    return (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => setPostType(type.value)}
                        className={`cursor-pointer ${postType === type.value ? "bg-gray-100" : ""}`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Visibility Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      visibility === "public"
                        ? "bg-green-500"
                        : visibility === "private"
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span className="capitalize">
                    {visibility === "only_me" ? "Only Me" : visibility}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => setVisibility("public")}
                  className={`cursor-pointer ${visibility === "public" ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Public
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setVisibility("private")}
                  className={`cursor-pointer ${visibility === "private" ? "bg-orange-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    Private
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setVisibility("only_me")}
```python
                  className={`cursor-pointer ${visibility === "only_me" ? "bg-red-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    Only Me
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyRichTextFormat("bold")}
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyRichTextFormat("italic")}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertList}
              className="h-8 w-8 p-0"
              title="List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyRichTextFormat("link")}
              className="h-8 w-8 p-0"
              title="Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <DropdownMenu
              open={showEmojiPicker}
              onOpenChange={setShowEmojiPicker}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1 p-2">
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content Area */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={postText}
              onChange={handleTextChange}
              placeholder={
                postType === "ACHIEVEMENT"
                  ? "Share your achievement... (Use @ to mention connections, # for hashtags, **bold**, *italic*)"
                  : postType === "PROJECT"
                    ? "Tell us about your project... (Use @ to mention connections, # for hashtags, **bold**, *italic*)"
                    : postType === "QUESTION"
                      ? "Ask your question... (Use @ to mention connections, # for hashtags, **bold**, *italic*)"
                      : "What's on your mind? (Use @ to mention connections, # for hashtags, **bold**, *italic*)"
              }
              className={`min-h-[120px] resize-none border ${
                isOverLimit
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-pathpiper-teal"
              } focus:ring-1 ${
                isOverLimit
                  ? "focus:ring-red-500"
                  : "focus:ring-pathpiper-teal"
              }`}
              disabled={isPosting}
            />

            {/* Mentions Dropdown */}
            {showMentions && filteredConnections.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto">
                {filteredConnections.slice(0, 5).map((connection) => (
                  <div
                    key={connection.id}
                    onClick={() => insertMention(connection)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={
                          connection.user.profileImageUrl ||
                          "/images/default-profile.png"
                        }
                        alt={`${connection.user.firstName} ${connection.user.lastName}`}
                        width={32}
                        height={32}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-profile.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {connection.user.firstName}{" "}
                        {connection.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {connection.user.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`absolute bottom-2 right-2 text-xs font-medium ${
                isOverLimit
                  ? "text-red-500 bg-red-50 px-2 py-1 rounded"
                  : getActualCharacterCount(postText) > 250
                    ? "text-orange-500 bg-orange-50 px-2 py-1 rounded"
                    : "text-gray-400"
              }`}
            >
              {getActualCharacterCount(postText)}/{CHARACTER_LIMIT}
              {isOverLimit && <span className="ml-1">⚠️</span>}
            </div>
          </div>

          {/* Link Preview */}
          {linkPreview && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">
                  Link Preview
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkPreview(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                {linkPreview.image && (
                  <img
                    src={linkPreview.image}
                    alt="Link preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {linkPreview.title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {linkPreview.description}
                  </div>
                  <div className="text-xs text-blue-600 truncate">
                    {linkPreview.url}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Type Specific Fields */}
          {postType === "ACHIEVEMENT" && (
            <Select
              value={achievementType}
              onValueChange={setAchievementType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                {ACHIEVEMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {postType === "PROJECT" && (
            <Select
              value={projectCategory}
              onValueChange={setProjectCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project category" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Difficulty Level */}
          {(postType === "PROJECT" ||
            postType === "TUTORIAL" ||
            postType === "QUESTION") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Difficulty Level
              </label>
              <Select
                value={difficultyLevel}
                onValueChange={setDifficultyLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags - Auto-detected from content */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Hashtags detected in your post:
              </label>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Over limit warning */}
          {isOverLimit && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium mb-1 flex items-center gap-2">
                <span className="text-amber-500">⚠️</span>
                Content exceeds {CHARACTER_LIMIT} characters!
              </p>
              <p className="text-xs text-amber-600">
                Please shorten your content to {CHARACTER_LIMIT} characters
                or less.
              </p>
            </div>
          )}

          {/* Draft indicator */}
          {isDraft && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">💾</span>
                  <p className="text-sm text-blue-700 font-medium">
                    Draft saved with {trails.length} trail(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadDraft}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Load Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDraft}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Trails Display */}
          {trails.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Trails ({trails.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Save Draft
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {trails.map((trail, index) => (
                  <div
                    key={trail.id}
                    className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            Trail #{index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {trail.content}
                        </p>
                        {trail.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={trail.imageUrl}
                              alt="Trail image"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrail(trail.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Trail Form */}
          {showAddTrail && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-purple-700">
                  Add Trail
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddTrail(false);
                    setTrailContent("");
                    setTrailImageUrl(null);
                  }}
                  className="text-purple-500 hover:text-purple-700 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={trailContent}
                onChange={(e) => setTrailContent(e.target.value)}
                placeholder="Continue your story... (Trail content)"
                className="min-h-[80px] resize-none border border-purple-200 focus:border-purple-400"
              />

              {trailImageUrl && (
                <div className="relative">
                  <img
                    src={trailImageUrl}
                    alt="Trail image"
                    className="max-w-full h-auto rounded-lg border border-purple-200"
                    style={{ maxHeight: "200px" }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTrailImageUrl(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!trailImageUrl && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleTrailImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="trail-image-upload"
                      />
                      <label htmlFor="trail-image-upload">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-gray-100"
                          asChild
                        >
                          <span>
                            <ImageIcon className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                  <div className="text-xs text-purple-600">
                    {trailContent.length}/287 characters
                  </div>
                </div>

                <Button
                  onClick={addTrail}
                  disabled={
                    !trailContent.trim() || trailContent.length > 287
                  }
                  size="sm"
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  Add Trail
                </Button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Post image"
                className="max-w-full h-auto rounded-lg border border-gray-200"
                style={{ maxHeight: "300px" }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {/* Only show upload button if no image is uploaded */}
              {!imageUrl && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 h-8 w-8 p-0 rounded-full cursor-pointer hover:bg-gray-100"
                      asChild
                    >
                      <span>
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
              )}

              {/* Add Trail Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTrail(true)}
                disabled={showAddTrail}
                className="text-purple-600 border-purple-300 hover:bg-purple-50 rounded-full px-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Trail
              </Button>

              <div className="text-xs text-gray-400">
                {!imageUrl ? "Max 1MB" : "1 image max"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Draft Button */}
              {(postText.trim() || trails.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50 rounded-full px-4"
                >
                  Save Draft
                </Button>
              )}

              <Button
                onClick={handlePost}
                disabled={!postText.trim() || isPosting || isOverLimit}
                size="sm"
                className={`${selectedPostType?.color || "bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue"} text-white rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200 ${isOverLimit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {selectedPostType && (
                  <selectedPostType.icon className="h-4 w-4 mr-1" />
                )}
                {isPosting
                  ? "Posting..."
                  : trails.length > 0
                    ? `Post with ${trails.length} Trail(s)`
                    : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (showModerationHelper) {
    return (
      <ModerationHelper
        content={postText}
        onSuggestionSelect={(suggestion) => {
          setPostText(suggestion);
          setHasUnsavedChanges(true);
        }}
        onClose={() => setShowModerationHelper(false)}
      />
    );
  }

  if (isTrail) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user?.profileImageUrl || "/images/default-profile.png"}
                alt="Your profile"
                width={40}
                height={40}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/default-profile.png";
                }}
              />
            </div>
            <div className="flex-1">
              {/* Compact Trail Preview Above Input */}
              {trailContext && (
                <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-purple-700 font-medium mb-2 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Adding to trail
                  </div>

                  {/* Parent Post Preview */}
                  <div className="mb-2 p-2 bg-white rounded border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 w-4 rounded-full overflow-hidden">
                        <Image
                          src={
                            trailContext.author?.profileImageUrl ||
                            "/images/default-profile.png"
                          }
                          alt={`${trailContext.author?.firstName} ${trailContext.author?.lastName}`}
                          width={16}
                          height={16}
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/default-profile.png";
                          }}
                        />
                      </div>
                      <span className="font-medium text-xs">
                        {trailContext.author?.firstName}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">
                        Original
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {trailContext.content}
                    </p>
                  </div>

                  {/* Recent Trail Messages Preview */}
                  {trailContext.trails && trailContext.trails.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {trailContext.trails
                        .slice(-2)
                        .map((trail: any, index: number) => (
                          <div
                            key={trail.id}
                            className="p-1.5 bg-white rounded border border-purple-100"
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="h-3 w-3 rounded-full overflow-hidden">
                                <Image
                                  src={
                                    trail.author?.profileImageUrl ||
                                    "/images/default-profile.png"
                                  }
                                  alt={`${trail.author?.firstName} ${trail.author?.lastName}`}
                                  width={12}
                                  height={12}
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/images/default-profile.png";
                                  }}
                                />
                              </div>
                              <span className="font-medium text-xs">
                                {trail.author?.firstName}
                              </span>
                              <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">
                                #{trail.trailOrder}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 pl-4 line-clamp-1">
                              {trail.content}
                            </p>
                          </div>
                        ))}
                      {trailContext.trails.length > 2 && (
                        <div className="text-xs text-purple-600 text-center py-1">
                          +{trailContext.trails.length - 2} more messages
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={handleTextChange}
                  placeholder="Continue your trail... (Use @ to mention connections, # for hashtags)"
                  className="min-h-[80px] resize-none border border-gray-200 focus:border-pathpiper-teal focus:ring-1 focus:ring-pathpiper-teal"
                  disabled={isPosting}
                />

                {/* Mentions Dropdown for Trail */}
                {showMentions && filteredConnections.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredConnections.slice(0, 5).map((connection) => (
                      <div
                        key={connection.id}
                        onClick={() => insertMention(connection)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={
                              connection.user.profileImageUrl ||
                              "/images/default-profile.png"
                            }
                            alt={`${connection.user.firstName} ${connection.user.lastName}`}
                            width={32}
                            height={32}
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/images/default-profile.png";
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {connection.user.firstName}{" "}
                            {connection.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {connection.user.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rich Text Toolbar for Trail */}
              <div className="flex items-center gap-2 mt-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyRichTextFormat("bold")}
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyRichTextFormat("italic")}
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insertList}
                  className="h-8 w-8 p-0"
                  title="List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyRichTextFormat("link")}
                  className="h-8 w-8 p-0"
                  title="Link"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <DropdownMenu
                  open={showEmojiPicker}
                  onOpenChange={setShowEmojiPicker}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1 p-2">
                      {EMOJIS.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-400">
                  {getActualCharacterCount(postText)}/{CHARACTER_LIMIT}{" "}
                  characters
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!postText.trim() || isPosting || isOverLimit}
                  className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue text-white rounded-full px-4"
                >
                  Add Trail
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <CompactCreatePost />
      <FullCreatePostOverlay />
    </>
  );
}