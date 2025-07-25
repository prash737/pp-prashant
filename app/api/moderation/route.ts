import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ModerationRequest {
  content: string;
  type: "post" | "comment" | "profile" | "message";
  userId: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface ModerationResult {
  status: "approved" | "pending_review" | "flagged" | "rejected";
  riskScore: number;
  flags: string[];
  reason?: string;
  suggestions?: string[];
  requiresHumanReview: boolean;
  detectedLanguage?: string;
  safeAlternatives?: string[];
}

// Pre-approved vocabulary for children (expandable)
const CHILD_SAFE_VOCABULARY = [
  "happy",
  "fun",
  "play",
  "learn",
  "study",
  "friend",
  "school",
  "teacher",
  "book",
  "game",
  "art",
  "music",
  "dance",
  "sport",
  "science",
  "math",
  "reading",
  "writing",
  "adventure",
  "explore",
  "create",
  "build",
  "design",
  "project",
  "team",
  "help",
  "share",
  "kind",
  "nice",
  "good",
  "great",
  "awesome",
  "cool",
  "amazing",
  "wonderful",
  "beautiful",
  "smart",
  "creative",
  "talented",
  "brave",
  "strong",
  "gentle",
  "caring",
  "family",
  "parent",
  "sibling",
  "pet",
  "nature",
  "animal",
  "flower",
  "tree",
  "sunshine",
  "rainbow",
  "star",
  "moon",
  "earth",
  "water",
  "food",
  "healthy",
  "exercise",
  "sleep",
  "dream",
  "hope",
  "wish",
  "birthday",
  "celebration",
  "gift",
];

// Safe phrase suggestions for common scenarios
const SAFE_PHRASE_SUGGESTIONS = {
  frustration: [
    "I need help with this",
    "This is challenging for me",
    "I'm working hard on this",
  ],
  disagreement: [
    "I have a different idea",
    "Let's talk about this",
    "I respect your opinion",
  ],
  sadness: [
    "I'm feeling down today",
    "I need some encouragement",
    "This is hard for me",
  ],
  excitement: [
    "I'm really happy about this!",
    "This is so cool!",
    "I can't wait to share this!",
  ],
  achievement: [
    "I worked really hard on this",
    "I'm proud of my progress",
    "I learned something new today",
  ],
};

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Moderation API endpoint called");
    const body = await request.json();
    const startTime = Date.now();

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

    const { content, type, userId, imageUrl, videoUrl } = body;

    if (!content || !type || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Only moderate posts and comments for performance
    if (type !== "post" && type !== "comment") {
      return NextResponse.json({
        success: true,
        moderation: {
          status: "approved",
          riskScore: 0,
          flags: [],
          requiresHumanReview: false,
          processingTime: Date.now() - startTime,
        },
      });
    }

    // Use optimized moderation service
    const { moderationService } = await import(
      "@/lib/services/moderation-service"
    );
    const result = await moderationService.moderateContent(
      content,
      userId,
      type,
    );

    // Handle image/video moderation if needed
    if (imageUrl) {
      const imageResult = await moderateImage(imageUrl);
      if (imageResult.riskScore > result.riskScore) {
        result.riskScore += imageResult.riskScore;
        result.flags.push(...imageResult.flags);
        result.requiresHumanReview =
          result.requiresHumanReview || imageResult.requiresHumanReview;
      }
    }

    // Queue for human review if needed
    if (result.requiresHumanReview) {
      await queueForHumanReview(
        userId,
        type,
        content,
        result,
        imageUrl,
        videoUrl,
      );
    }

    console.log(
      `📊 Moderation completed in ${result.processingTime}ms - Status: ${result.status}`,
    );

    return NextResponse.json({ success: true, moderation: result });
  } catch (error) {
    console.error("Moderation API error:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}

async function performComprehensiveModeration(
  content: string,
  type: string,
  userId: string,
  imageUrl?: string,
  videoUrl?: string,
): Promise<ModerationResult> {
  let riskScore = 0;
  const flags: string[] = [];
  const suggestions: string[] = [];
  let requiresHumanReview = false;
  let safeAlternatives: string[] = [];

  // 1. PROFANITY AND INAPPROPRIATE LANGUAGE (Enhanced)
  const profanityPatterns = [
    // Explicit profanity
    /\b(fuck|shit|damn|bitch|asshole|bastard|crap|piss|hell|bloody|goddamn|motherfucker|cocksucker|dickhead|whore|slut|cunt)\b/gi,
    // Hate speech and slurs
    /\b(faggot|nigger|retard|spic|chink|kike|wetback|towelhead|raghead)\b/gi,
    // Sexual content
    /\b(sex|porn|nude|naked|boobs|tits|penis|vagina|dick|cock|pussy|masturbat|orgasm|horny|sexy|erotic|xxx|fetish|bdsm)\b/gi,
    // Disguised profanity
    /\b(f\*ck|sh\*t|d\*mn|b\*tch|a\*\*hole|f\*\*k|s\*\*t|wtf|stfu|gtfo)\b/gi,
    // Leetspeak profanity
    /\b(fvck|sh1t|b1tch|a55hole|fück|shït|dämn)\b/gi,
  ];

  profanityPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 10;
      flags.push("explicit_language");
      suggestions.push("Please use appropriate language suitable for children");
    }
  });

  // 2. VIOLENCE AND THREATS (Enhanced)
  const violencePatterns = [
    /\b(kill|murder|death|suicide|bomb|gun|weapon|knife|stab|shoot|attack|hurt|harm|violence|fight|beat|punch|kick|slap|hit|destroy|annihilate|eliminate|assassinate|torture|abuse|rape|assault|terror|threat|die|dead|blood|gore|brutal|savage|execute|massacre|slaughter)\b/gi,
    // Indirect violence
    /\b(i'll (kill|hurt|destroy|beat|punch) you|you (should|deserve to) die|go (kill|hurt) yourself|i (hate|want to hurt) you)\b/gi,
    // Weapon references
    /\b(pistol|rifle|shotgun|ak47|grenade|explosive|machete|sword|dagger|chainsaw|poison|acid)\b/gi,
  ];

  violencePatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 15;
      flags.push("violence_threats");
      requiresHumanReview = true;
      suggestions.push(
        "Content contains violent language not suitable for children",
      );
    }
  });

  // 3. SELF-HARM AND MENTAL HEALTH CONCERNS (Critical)
  const selfHarmPatterns = [
    /\b(self.harm|cutting|suicide|kill myself|end it all|hurt myself|self.injury|overdose|pills|razor|blade|wrist|hanging|depression|hopeless|worthless|want to die|no reason to live|better off dead)\b/gi,
    /\b(i (want to|should|will) (die|kill myself|hurt myself|end it all))\b/gi,
  ];

  selfHarmPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 20;
      flags.push("self_harm");
      requiresHumanReview = true;
      suggestions.push(
        "If you're having difficult feelings, please talk to a trusted adult or counselor",
      );
    }
  });

  // 4. PERSONAL INFORMATION DISCLOSURE (Child Safety)
  const personalInfoPatterns = [
    // Phone numbers
    /\b(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Addresses
    /\b\d+\s+[A-Za-z0-9\s,.-]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b/gi,
    // Social security numbers
    /\b\d{3}-\d{2}-\d{4}\b/g,
    // Personal identifiers
    /\b(my (address|phone|email|location|school) is|i live at|my house is|come to my|meet me at)\b/gi,
  ];

  personalInfoPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 25;
      flags.push("personal_information");
      requiresHumanReview = true;
      suggestions.push(
        "Never share personal information like addresses, phone numbers, or email addresses online",
      );
    }
  });

  // 5. BULLYING AND HARASSMENT
  const bullyingPatterns = [
    /\b(you (are|look|sound) (stupid|ugly|fat|dumb|weird|loser|pathetic|worthless))\b/gi,
    /\b(nobody likes you|everyone hates you|you have no friends|kill yourself|go away|shut up|you suck)\b/gi,
    /\b(i (hate|don't like) you|you're (annoying|stupid|ugly|fat|dumb|weird))\b/gi,
  ];

  bullyingPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 12;
      flags.push("bullying");
      requiresHumanReview = true;
      suggestions.push("Please be kind and respectful to others");
    }
  });

  // 6. INAPPROPRIATE MEETINGS AND STRANGER DANGER
  const strangerDangerPatterns = [
    /\b(meet (me|up)|let's meet|come over|i'll pick you up|send me your|what's your address|where do you live)\b/gi,
    /\b(don't tell (your parents|anyone)|this is our secret|keep this between us|adults don't need to know)\b/gi,
    /\b(age\/sex\/location|a\/s\/l|how old are you|are you alone|send (me )?pic|photo of you)\b/gi,
  ];

  strangerDangerPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 30;
      flags.push("stranger_danger");
      requiresHumanReview = true;
      suggestions.push(
        "Never arrange to meet strangers online or share personal information",
      );
    }
  });

  // 7. DRUG AND SUBSTANCE REFERENCES
  const substancePatterns = [
    /\b(cocaine|heroin|meth|marijuana|weed|drugs|dealer|addiction|overdose|high|stoned|drunk|alcohol|beer|wine|vodka|whiskey|smoking|cigarette|tobacco|vape|juul)\b/gi,
    /\b(getting (high|drunk|wasted|stoned)|smoking (weed|pot)|drinking (alcohol|beer)|doing drugs)\b/gi,
  ];

  substancePatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      riskScore += matches.length * 8;
      flags.push("substance_references");
      suggestions.push(
        "Content about drugs and alcohol is not appropriate for children",
      );
    }
  });

  // 8. PRE-APPROVED VOCABULARY CHECK
  const words = content.toLowerCase().split(/\s+/);
  const nonApprovedWords = words.filter(
    (word) =>
      word.length > 2 &&
      !CHILD_SAFE_VOCABULARY.includes(word) &&
      !/^\d+$/.test(word) && // Allow numbers
      !/^[.,!?;:()]+$/.test(word), // Allow punctuation
  );

  if (nonApprovedWords.length > words.length * 0.3) {
    riskScore += 3;
    flags.push("vocabulary_check");
    suggestions.push("Consider using simpler, more child-friendly language");
  }

  // 9. GENERATE SAFE ALTERNATIVES
  safeAlternatives = generateSafeAlternatives(content, flags);

  // 10. IMAGE MODERATION (if image provided)
  if (imageUrl) {
    const imageModeration = await moderateImage(imageUrl);
    riskScore += imageModeration.riskScore;
    flags.push(...imageModeration.flags);
    if (imageModeration.requiresHumanReview) {
      requiresHumanReview = true;
    }
  }

  // 11. VIDEO MODERATION (if video provided)
  if (videoUrl) {
    const videoModeration = await moderateVideo(videoUrl);
    riskScore += videoModeration.riskScore;
    flags.push(...videoModeration.flags);
    if (videoModeration.requiresHumanReview) {
      requiresHumanReview = true;
    }
  }

  // 12. SENTIMENT ANALYSIS
  const sentimentScore = analyzeSentiment(content);
  if (sentimentScore < -0.5) {
    riskScore += 2;
    flags.push("negative_sentiment");
    suggestions.push("Try to express your thoughts in a more positive way");
  }

  // 13. PATTERN-BASED DETECTION
  // Excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 10) {
    riskScore += 2;
    flags.push("excessive_caps");
    suggestions.push("Using too many capital letters can seem like shouting");
  }

  // Repeated characters
  if (/(.)\1{4,}/.test(content)) {
    riskScore += 1;
    flags.push("repeated_chars");
  }

  // Final decision logic
  let status: "approved" | "pending_review" | "flagged" | "rejected";
  let reason = "";

  if (
    riskScore >= 25 ||
    flags.some((flag) =>
      ["self_harm", "violence_threats", "stranger_danger"].includes(flag),
    )
  ) {
    status = "rejected";
    reason = "Content contains highly inappropriate or dangerous material";
    requiresHumanReview = true;
  } else if (
    riskScore >= 15 ||
    flags.some((flag) => ["bullying", "personal_information"].includes(flag))
  ) {
    status = "pending_review";
    reason = "Content requires human review before publication";
    requiresHumanReview = true;
  } else if (
    riskScore >= 5 ||
    flags.some((flag) =>
      ["explicit_language", "substance_references"].includes(flag),
    )
  ) {
    status = "flagged";
    reason = "Content flagged for potential issues";
    requiresHumanReview = true;
  } else {
    status = "approved";
    reason = "Content approved for publication";
  }

  return {
    status,
    riskScore,
    flags: [...new Set(flags)], // Remove duplicates
    reason,
    suggestions: [...new Set(suggestions)],
    requiresHumanReview,
    safeAlternatives,
  };
}

async function moderateImage(
  imageUrl: string,
): Promise<{
  riskScore: number;
  flags: string[];
  requiresHumanReview: boolean;
}> {
  try {
    console.log(`🖼️ Moderating image: ${imageUrl}`);

    // Basic file extension and size checks first
    const suspiciousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".scr",
      ".zip",
      ".rar",
    ];
    const extension = imageUrl.split(".").pop()?.toLowerCase();

    if (extension && suspiciousExtensions.includes(`.${extension}`)) {
      return {
        riskScore: 20,
        flags: ["suspicious_file"],
        requiresHumanReview: true,
      };
    }

    // Use Google Vision API if available
    if (process.env.GOOGLE_VISION_API_KEY) {
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requests: [
                {
                  image: { source: { imageUri: imageUrl } },
                  features: [
                    { type: "SAFE_SEARCH_DETECTION" },
                    { type: "TEXT_DETECTION" },
                    { type: "OBJECT_LOCALIZATION" },
                  ],
                },
              ],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const result = data.responses[0];

          let riskScore = 0;
          const flags: string[] = [];

          // Analyze SafeSearch results
          if (result.safeSearchAnnotation) {
            const safeSearch = result.safeSearchAnnotation;

            const likelihoodScores = {
              VERY_UNLIKELY: 0,
              UNLIKELY: 1,
              POSSIBLE: 3,
              LIKELY: 8,
              VERY_LIKELY: 15,
            };

            if (safeSearch.adult && likelihoodScores[safeSearch.adult] > 1) {
              riskScore += likelihoodScores[safeSearch.adult];
              flags.push("adult_content");
            }

            if (
              safeSearch.violence &&
              likelihoodScores[safeSearch.violence] > 1
            ) {
              riskScore += likelihoodScores[safeSearch.violence];
              flags.push("violent_content");
            }

            if (safeSearch.racy && likelihoodScores[safeSearch.racy] > 1) {
              riskScore += likelihoodScores[safeSearch.racy];
              flags.push("racy_content");
            }

            if (
              safeSearch.medical &&
              likelihoodScores[safeSearch.medical] > 3
            ) {
              riskScore += 2;
              flags.push("medical_content");
            }

            if (safeSearch.spoof && likelihoodScores[safeSearch.spoof] > 3) {
              riskScore += 3;
              flags.push("spoof_content");
            }
          }

          // Check for concerning objects
          if (result.localizedObjectAnnotations) {
            const concerningObjects = [
              "weapon",
              "gun",
              "knife",
              "drug",
              "alcohol",
            ];
            result.localizedObjectAnnotations.forEach((obj: any) => {
              if (
                concerningObjects.some((concern) =>
                  obj.name.toLowerCase().includes(concern),
                )
              ) {
                riskScore += 10;
                flags.push("concerning_object");
              }
            });
          }

          // Check text in images using our moderation service
          if (result.textAnnotations && result.textAnnotations.length > 0) {
            const detectedText = result.textAnnotations[0].description;
            if (detectedText && detectedText.length > 3) {
              // Use our existing text moderation
              const { moderationService } = await import(
                "@/lib/services/moderation-service"
              );
              const textResult = await moderationService.moderateContent(
                detectedText,
                "system",
                "image_text",
              );

              riskScore += textResult.riskScore * 0.3; // Reduce weight for text in images
              flags.push(...textResult.flags.map((f) => `image_text_${f}`));
            }
          }

          return {
            riskScore: Math.round(riskScore),
            flags,
            requiresHumanReview: riskScore > 5 || flags.length > 0,
          };
        }
      } catch (visionError) {
        console.error("Google Vision API error:", visionError);
      }
    }

    // Fallback: AWS Rekognition if Google Vision fails
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        // Note: This would require AWS SDK setup
        console.log("Could integrate AWS Rekognition as fallback");
      } catch (awsError) {
        console.error("AWS Rekognition error:", awsError);
      }
    }

    // Default behavior for child-safe environment
    return {
      riskScore: 3,
      flags: ["image_requires_review"],
      requiresHumanReview: true,
    };
  } catch (error) {
    console.error("Image moderation error:", error);
    return {
      riskScore: 10,
      flags: ["image_error"],
      requiresHumanReview: true,
    };
  }
}

async function moderateVideo(
  videoUrl: string,
): Promise<{
  riskScore: number;
  flags: string[];
  requiresHumanReview: boolean;
}> {
  try {
    console.log(`🎥 Moderating video: ${videoUrl}`);

    // Videos always require human review for children's content
    return {
      riskScore: 5,
      flags: ["video_content"],
      requiresHumanReview: true,
    };
  } catch (error) {
    console.error("Video moderation error:", error);
    return {
      riskScore: 15,
      flags: ["video_error"],
      requiresHumanReview: true,
    };
  }
}

function analyzeSentiment(content: string): number {
  // Simple sentiment analysis - in production, use a proper NLP library
  const positiveWords = [
    "happy",
    "good",
    "great",
    "awesome",
    "wonderful",
    "amazing",
    "love",
    "like",
    "enjoy",
    "fun",
    "excited",
    "proud",
  ];
  const negativeWords = [
    "sad",
    "bad",
    "terrible",
    "awful",
    "hate",
    "angry",
    "mad",
    "upset",
    "disappointed",
    "frustrated",
    "worried",
    "scared",
  ];

  const words = content.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  return score / words.length;
}

function generateSafeAlternatives(content: string, flags: string[]): string[] {
  const alternatives: string[] = [];

  if (flags.includes("explicit_language")) {
    alternatives.push("I'm frustrated with this situation");
    alternatives.push("This is really challenging");
    alternatives.push("I'm having a hard time with this");
  }

  if (flags.includes("bullying")) {
    alternatives.push("I disagree with your opinion");
    alternatives.push("I see things differently");
    alternatives.push("Let's talk about this respectfully");
  }

  if (flags.includes("negative_sentiment")) {
    alternatives.push("I'm working through some challenges");
    alternatives.push("I'm learning to handle difficult situations");
    alternatives.push("I could use some encouragement");
  }

  return alternatives;
}

async function logModerationDecision(
  userId: string,
  type: string,
  content: string,
  result: ModerationResult,
  imageUrl?: string,
  videoUrl?: string,
) {
  try {
    await prisma.moderationLog.create({
      data: {
        userId,
        contentType: type,
        content: content.substring(0, 1000), // Limit content length
        imageUrl,
        videoUrl,
        status: result.status,
        riskScore: result.riskScore,
        flags: result.flags,
        reason: result.reason,
        requiresHumanReview: result.requiresHumanReview,
        moderatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log moderation decision:", error);
  }
}

async function queueForHumanReview(
  userId: string,
  type: string,
  content: string,
  result: ModerationResult,
  imageUrl?: string,
  videoUrl?: string,
) {
  try {
    if (!prisma) {
      console.warn("Prisma client not available for human review queue");
      return;
    }

    await prisma.humanReviewQueue.create({
      data: {
        userId,
        contentType: type,
        content,
        imageUrl,
        videoUrl,
        status: result.status,
        riskScore: result.riskScore,
        flags: result.flags,
        reason: result.reason,
        priority:
          result.riskScore >= 20
            ? "high"
            : result.riskScore >= 10
              ? "medium"
              : "low",
        queuedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to queue for human review:", error);
    // Continue processing even if queuing fails
  }
}

// Get safe phrase suggestions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scenario = searchParams.get("scenario");

  if (
    scenario &&
    SAFE_PHRASE_SUGGESTIONS[scenario as keyof typeof SAFE_PHRASE_SUGGESTIONS]
  ) {
    return NextResponse.json({
      suggestions:
        SAFE_PHRASE_SUGGESTIONS[
          scenario as keyof typeof SAFE_PHRASE_SUGGESTIONS
        ],
    });
  }

  return NextResponse.json({
    vocabulary: CHILD_SAFE_VOCABULARY.slice(0, 50), // Return first 50 words
    suggestions: Object.values(SAFE_PHRASE_SUGGESTIONS).flat().slice(0, 10),
  });
}
