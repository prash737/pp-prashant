import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to calculate engagement score
function calculateEngagementScore(
  likes: number,
  comments: number,
  shares: number,
  views: number,
): number {
  const likeWeight = 1;
  const commentWeight = 2;
  const shareWeight = 3;
  const viewWeight = 0.1;

  return (
    likes * likeWeight +
    comments * commentWeight +
    shares * shareWeight +
    views * viewWeight
  );
}

// Function to determine age group from user data
async function getUserAgeGroup(userId: string): Promise<string | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (profile?.student?.birthYear && profile?.student?.birthMonth) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(profile.student.birthYear);
      const age = currentYear - birthYear;

      if (age < 13) return "elementary";
      if (age < 16) return "middle_school";
      if (age < 18) return "high_school";
      return "young_adult";
    }

    return "young_adult"; // Default
  } catch {
    return "young_adult";
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      content,
      imageUrl,
      parentPostId,
      isTrail = false,
      postType = "GENERAL",
      tags = [],
      subjects = [],
      achievementType,
      projectCategory,
      difficultyLevel,
      isQuestion = false,
      isAchievement = false,
      forceTrail = false,
      linkPreview,
    } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // For non-trail posts, enforce character limit strictly (287 chars as per frontend)
    if (content.length > 287 && !isTrail && !forceTrail) {
      return NextResponse.json(
        {
          error:
            "Content exceeds 287 characters. Please use 'Start Trail' to share longer content.",
          suggestTrail: true,
        },
        { status: 400 },
      );
    }

    // Get user's age group for content targeting
    const ageGroup = await getUserAgeGroup(user.id);

    // If it's a trail, get the next trail order
    let trailOrder = null;
    if (isTrail && parentPostId) {
      // Verify parent post exists
      const parentPost = await prisma.feedPost.findUnique({
        where: { id: parentPostId },
      });

      if (!parentPost) {
        return NextResponse.json(
          { error: "Parent post not found" },
          { status: 404 },
        );
      }

      // Get the highest trail order for this parent post
      const lastTrail = await prisma.feedPost.findFirst({
        where: {
          parentPostId,
          isTrail: true,
        },
        orderBy: { trailOrder: "desc" },
      });

      // Set trail order (starting from 1 for first trail)
      trailOrder = (lastTrail?.trailOrder || 0) + 1;

      console.log(
        `📝 Creating trail ${trailOrder} for parent post ${parentPostId}`,
      );
    }

    // Content moderation using the enhanced system
    const moderationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/moderation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          type: "post",
          userId: user.id,
          imageUrl,
          videoUrl: null, // Add video support if needed
        }),
      },
    );

    let moderationStatus = "approved"; // Default to approved for immediate posting
    if (moderationResponse.ok) {
      const moderationResult = await moderationResponse.json();
      moderationStatus = moderationResult.moderation.status;

      // If content is rejected, return error immediately
      if (moderationStatus === "rejected") {
        return NextResponse.json(
          {
            error: "Content violates community guidelines and cannot be posted",
            suggestions: moderationResult.moderation.suggestions,
          },
          { status: 400 },
        );
      }
    } else {
      // If moderation service fails, approve the post (fallback)
      console.warn("Moderation service failed, defaulting to approved status");
      moderationStatus = "approved";
    }

    const post = await prisma.feedPost.create({
      data: {
        userId: user.id,
        content,
        imageUrl: imageUrl || null,
        isTrail,
        parentPostId,
        trailOrder,
        postType: postType as any,
        tags,
        subjects,
        ageGroup,
        difficultyLevel,
        isQuestion,
        isAchievement,
        achievementType: isAchievement ? achievementType : null,
        projectCategory: postType === "PROJECT" ? projectCategory : null,
        moderationStatus,
        engagementScore: 0,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            student: {
              select: {
                age_group: true,
              },
            },
          },
        },
        trails: {
          orderBy: { trailOrder: "asc" },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    // Update engagement score based on post type and content
    let initialEngagementBoost = 0;
    if (postType === "ACHIEVEMENT") initialEngagementBoost = 5;
    if (postType === "PROJECT") initialEngagementBoost = 3;
    if (postType === "QUESTION") initialEngagementBoost = 2;

    if (initialEngagementBoost > 0) {
      await prisma.feedPost.update({
        where: { id: post.id },
        data: { engagementScore: initialEngagementBoost },
      });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const postType = searchParams.get("type");
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause based on filters
    const whereClause: any = {
      isTrail: false,
      moderationStatus: "approved",
    };

    // Log for debugging
    console.log("📋 Feed query filters:", {
      filter,
      postType,
      subject,
      difficulty,
      whereClause,
    });

    if (postType && postType !== "all") {
      whereClause.postType = postType;
    }

    if (subject) {
      whereClause.subjects = {
        has: subject,
      };
    }

    if (difficulty) {
      whereClause.difficultyLevel = difficulty;
    }

    // Additional filtering based on filter type
    if (filter === "achievements") {
      whereClause.isAchievement = true;
    } else if (filter === "projects") {
      whereClause.postType = "PROJECT";
    } else if (filter === "questions") {
      whereClause.isQuestion = true;
    }

    // Order by engagement score and recency
    const orderBy =
      filter === "trending"
        ? [{ engagementScore: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    // Get current user's likes
    let userLikes: string[] = [];
    let user: any = null;
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (accessToken) {
      const { data: authData, error } =
        await supabase.auth.getUser(accessToken);
      if (authData?.user) {
        user = authData.user;
        const likes = await prisma.postLike.findMany({
          where: { userId: user.id },
          select: { postId: true },
        });
        userLikes = likes.map((like) => like.postId);
      }
    }

    const posts = await prisma.feedPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            student: {
              select: {
                age_group: true,
              },
            },
          },
        },
        parentPost: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
        trails: {
          where: {
            isTrail: true,
            moderationStatus: "approved",
          },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { trailOrder: "asc" },
          take: 10, // Limit trails to prevent large responses
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: offset,
    });

    console.log("📊 Feed query results:", {
      totalFound: posts.length,
      userPosts: user ? posts.filter((p) => p.userId === user.id).length : 0,
      moderationStatuses: posts.reduce((acc: any, post) => {
        acc[post.moderationStatus] = (acc[post.moderationStatus] || 0) + 1;
        return acc;
      }, {}),
      recentPostIds: posts.slice(0, 3).map((p) => ({
        id: p.id.substring(0, 8),
        author: p.author
          ? `${p.author.firstName} ${p.author.lastName}`
          : "No Author",
        status: p.moderationStatus,
        created: p.createdAt,
      })),
    });

    console.log(`📊 Feed query results: Found ${posts.length} posts`);

    // Filter out posts with missing authors to prevent display errors
    const validPosts = posts.filter((post) => {
      const hasAuthor = post.author && post.author.firstName;
      const hasContent = post.content && post.content.trim() !== "";
      const isValid = hasAuthor && hasContent;

      if (!isValid) {
        console.warn(
          `⚠️ Filtering out invalid post ${post.id}: missing author=${!hasAuthor}, missing content=${!hasContent}`,
        );
      }
      return isValid;
    });

    console.log(
      `✅ Valid posts after filtering: ${validPosts.length}/${posts.length}`,
    );

    // Add isLikedByUser field to each post
    const postsWithLikeStatus = validPosts.map((post) => ({
      ...post,
      isLikedByUser: userLikes.includes(post.id),
    }));

    // Update view counts for returned posts
    const postIds = validPosts.map((post) => post.id);
    if (postIds.length > 0) {
      await prisma.feedPost.updateMany({
        where: { id: { in: postIds } },
        data: { viewsCount: { increment: 1 } },
      });
    }

    const formattedPosts = posts.map((post) => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        subjects: Array.isArray(post.subjects) ? post.subjects : [],
        likesCount: post.likesCount || post._count?.likes || 0,
        commentsCount: post.commentsCount || post._count?.comments || 0,
        bookmarksCount: post.bookmarksCount || post._count?.bookmarks || 0,
      }));

    return NextResponse.json({
      posts: formattedPosts.map((post) => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        subjects: Array.isArray(post.subjects) ? post.subjects : [],
        // Ensure consistent like data structure
        likesCount: post.likesCount || 0,
        _count: {
          ...post._count,
          likes: post.likesCount || 0,
        },
      })),
      hasMore: false, // Add pagination support if needed
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// Enhanced content moderation function
async function moderateContent(
  content: string,
  imageUrl?: string,
): Promise<string> {
  let riskScore = 0;
  const flags: string[] = [];

  // 1. Profanity and Inappropriate Language Detection
  const profanityWords = [
    "fuck",
    "shit",
    "damn",
    "bitch",
    "asshole",
    "bastard",
    "crap",
    "piss",
    "hell",
    "bloody",
    "goddamn",
    "motherfucker",
    "cocksucker",
    "dickhead",
    "whore",
    "slut",
    "faggot",
    "nigger",
    "retard",
    "gay",
    "lesbian",
  ];

  // 2. Violence and Threats Detection
  const violenceWords = [
    "kill",
    "murder",
    "death",
    "suicide",
    "bomb",
    "gun",
    "weapon",
    "knife",
    "stab",
    "shoot",
    "attack",
    "hurt",
    "harm",
    "violence",
    "fight",
    "beat",
    "punch",
    "kick",
    "slap",
    "hit",
    "destroy",
    "annihilate",
    "eliminate",
    "assassinate",
    "torture",
    "abuse",
    "rape",
    "assault",
    "terror",
    "threat",
  ];

  // 3. Sexual Content Detection
  const sexualWords = [
    "sex",
    "porn",
    "nude",
    "naked",
    "boobs",
    "penis",
    "vagina",
    "orgasm",
    "masturbate",
    "horny",
    "sexy",
    "erotic",
    "xxx",
    "adult",
    "fetish",
    "bdsm",
    "kinky",
    "oral",
    "anal",
    "threesome",
    "prostitute",
    "escort",
  ];

  // 4. Hate Speech Detection
  const hateWords = [
    "nazi",
    "hitler",
    "terrorist",
    "racism",
    "racist",
    "sexist",
    "homophobe",
    "transphobe",
    "xenophobe",
    "bigot",
    "supremacist",
    "genocide",
    "holocaust",
    "jihad",
    "infidel",
    "savage",
    "primitive",
    "subhuman",
  ];

  // 5. Drug and Substance Abuse Detection
  const drugWords = [
    "cocaine",
    "heroin",
    "meth",
    "marijuana",
    "weed",
    "drugs",
    "dealer",
    "addiction",
    "overdose",
    "high",
    "stoned",
    "drunk",
    "alcohol",
    "beer",
    "wine",
    "vodka",
    "whiskey",
    "smoking",
    "cigarette",
    "tobacco",
  ];

  // 6. Spam and Scam Detection
  const spamWords = [
    "spam",
    "fake",
    "scam",
    "cheat",
    "hack",
    "illegal",
    "pirated",
    "stolen",
    "free money",
    "get rich quick",
    "click here",
    "limited time",
    "act now",
    "guaranteed",
    "risk-free",
    "no catch",
    "special offer",
    "urgent",
  ];

  // 7. Self-Harm Detection
  const selfHarmWords = [
    "self-harm",
    "cutting",
    "suicide",
    "kill myself",
    "end it all",
    "depression",
    "hopeless",
    "worthless",
    "want to die",
    "hurt myself",
    "self-injury",
    "overdose",
    "pills",
    "razor",
    "blade",
    "wrist",
    "hanging",
  ];

  const lowerContent = content.toLowerCase();

  // Check each category and assign risk scores
  profanityWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 3;
      flags.push("profanity");
    }
  });

  violenceWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 5;
      flags.push("violence");
    }
  });

  sexualWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 4;
      flags.push("sexual_content");
    }
  });

  hateWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 6;
      flags.push("hate_speech");
    }
  });

  drugWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 3;
      flags.push("substance_abuse");
    }
  });

  spamWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 2;
      flags.push("spam");
    }
  });

  selfHarmWords.forEach((word) => {
    if (lowerContent.includes(word)) {
      riskScore += 8;
      flags.push("self_harm");
    }
  });

  // 8. Pattern-based detection
  // Excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 10) {
    riskScore += 2;
    flags.push("excessive_caps");
  }

  // Repeated characters (e.g., "sooooo")
  if (/(.)\1{3,}/.test(content)) {
    riskScore += 1;
    flags.push("repeated_chars");
  }

  // Excessive punctuation
  if (/[!?]{3,}/.test(content)) {
    riskScore += 1;
    flags.push("excessive_punctuation");
  }

  // URLs in posts (potential spam)
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern);
  if (urls && urls.length > 2) {
    riskScore += 3;
    flags.push("multiple_urls");
  }

  // 9. Phone numbers and emails (potential spam)
  const phonePattern =
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  if (phonePattern.test(content)) {
    riskScore += 2;
    flags.push("phone_number");
  }

  if (emailPattern.test(content)) {
    riskScore += 2;
    flags.push("email_address");
  }

  // 10. Age-inappropriate content detection based on educational context
  const educationalViolations = [
    "skip school",
    "ditch class",
    "fake sick",
    "cheat on test",
    "copy homework",
    "hate teacher",
    "teacher sucks",
    "school is stupid",
    "dropout",
    "fail on purpose",
  ];

  educationalViolations.forEach((phrase) => {
    if (lowerContent.includes(phrase)) {
      riskScore += 2;
      flags.push("educational_violation");
    }
  });

  // Log moderation results for monitoring
  console.log(`📋 Content Moderation Results:`);
  console.log(`   - Content: "${content.substring(0, 50)}..."`);
  console.log(`   - Risk Score: ${riskScore}`);
  console.log(`   - Flags: ${flags.join(", ") || "none"}`);

  // Decision logic
  if (
    riskScore >= 8 ||
    flags.includes("self_harm") ||
    flags.includes("hate_speech")
  ) {
    return "rejected";
  } else if (
    riskScore >= 4 ||
    flags.includes("violence") ||
    flags.includes("sexual_content")
  ) {
    return "pending_review";
  } else if (riskScore >= 2) {
    return "flagged";
  }

  return "approved";
}

// Image content moderation (basic implementation)
async function moderateImage(imageUrl: string): Promise<string> {
  try {
    // This is a placeholder for image moderation
    // In production, you would integrate with services like:
    // - Google Cloud Vision API
    // - AWS Rekognition
    // - Microsoft Azure Computer Vision

    console.log(`🖼️ Image moderation check for: ${imageUrl}`);

    // Basic checks on file extension and size could be done here
    const suspiciousExtensions = [".exe", ".bat", ".cmd", ".scr"];
    const extension = imageUrl.split(".").pop()?.toLowerCase();

    if (extension && suspiciousExtensions.includes(`.${extension}`)) {
      return "rejected";
    }

    // For now, approve all images
    // TODO: Implement actual image content analysis
    return "approved";
  } catch (error) {
    console.error("Image moderation error:", error);
    return "pending_review";
  }
}