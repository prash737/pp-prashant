import { prisma } from "@/lib/prisma";

// External API Configuration
interface ExternalModerationConfig {
  openai: {
    apiKey: string | undefined;
    enabled: boolean;
  };
  googleVision: {
    apiKey: string | undefined;
    enabled: boolean;
  };
  perspective: {
    apiKey: string | undefined;
    enabled: boolean;
  };
}

interface ModerationConfig {
  enableCache: boolean;
  enableMLModeration: boolean;
  cacheExpiryMinutes: number;
  fastTrackThreshold: number;
}

interface ModerationResult {
  status: "approved" | "pending_review" | "flagged" | "rejected";
  riskScore: number;
  flags: string[];
  confidence: number;
  processingTime: number;
  reason?: string;
  suggestions?: string[];
  requiresHumanReview: boolean;
}

class OptimizedModerationService {
  private cache = new Map<
    string,
    { result: ModerationResult; timestamp: number }
  >();
  private config: ModerationConfig = {
    enableCache: true,
    enableMLModeration: true, // Now enabled with external APIs
    cacheExpiryMinutes: 30,
    fastTrackThreshold: 3,
  };

  private externalConfig: ExternalModerationConfig = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      enabled: !!process.env.OPENAI_API_KEY,
    },
    googleVision: {
      apiKey: process.env.GOOGLE_VISION_API_KEY,
      enabled: !!process.env.GOOGLE_VISION_API_KEY,
    },
    perspective: {
      apiKey: process.env.PERSPECTIVE_API_KEY,
      enabled: !!process.env.PERSPECTIVE_API_KEY,
    },
  };

  // Fast pattern-based moderation for low-risk content
  private async fastTrackModeration(
    content: string,
  ): Promise<ModerationResult | null> {
    const startTime = Date.now();

    // Quick profanity check
    const basicProfanity = /\b(fuck|shit|damn|bitch)\b/gi;
    const profanityMatches = content.match(basicProfanity);

    // Safe content indicators
    const safePatterns = [
      /\b(learn|study|school|homework|project|assignment)\b/gi,
      /\b(happy|excited|proud|grateful|thankful)\b/gi,
    ];

    const isSafeContent = safePatterns.some((pattern) => pattern.test(content));
    const hasBasicProfanity = profanityMatches && profanityMatches.length > 0;

    // Fast-track approval for clearly safe content
    if (isSafeContent && !hasBasicProfanity && content.length < 500) {
      return {
        status: "approved",
        riskScore: 0,
        flags: [],
        confidence: 0.95,
        processingTime: Date.now() - startTime,
        requiresHumanReview: false,
      };
    }

    return null; // Needs full moderation
  }

  // Comprehensive moderation with optimizations
  private async comprehensiveModeration(
    content: string,
  ): Promise<ModerationResult> {
    const startTime = Date.now();
    let riskScore = 0;
    const flags: string[] = [];
    let confidence = 0.8;

    // Enhanced pattern matching with context awareness
    const patterns = {
      violence: {
        high: /\b(kill|murder|shoot|stab|bomb|terrorist|massacre|slaughter|execute|torture|assault)\b/gi,
        medium:
          /\b(hurt|harm|fight|attack|beat|punch|kick|weapon|gun|knife|blood|brutal|destroy)\b/gi,
        low: /\b(hit|slap|die|dead|eliminate|threat|terror)\b/gi,
      },
      selfHarm: {
        critical:
          /\b(suicide|kill myself|end it all|want to die|better off dead|no reason to live)\b/gi,
        high: /\b(hurt myself|cut myself|cutting|overdose|razor|blade|wrist|hanging)\b/gi,
        medium: /\b(self.harm|pills|depressed|hopeless|worthless)\b/gi,
      },
      personalInfo: {
        critical:
          /\b(\d{3}-\d{2}-\d{4}|\d{10}|\b\d+\s+[A-Za-z0-9\s,.-]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b)\b/gi,
        high: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi,
        medium: /\b(my address|phone number|where I live|my school is)\b/gi,
      },
      bullying: {
        high: /\b(you (are|look|sound) (stupid|ugly|fat|dumb|weird|loser|pathetic|worthless)|kill yourself|nobody likes you|everyone hates you)\b/gi,
        medium:
          /\b(you have no friends|go away|shut up|you suck|i hate you|you're annoying)\b/gi,
        low: /\b(dumb|stupid|weird|ugly)\b/gi,
      },
      inappropriate: {
        high: /\b(sex|porn|nude|naked|cocaine|heroin|meth)\b/gi,
        medium: /\b(drugs|marijuana|weed|alcohol|drunk|high|stoned)\b/gi,
        low: /\b(smoking|cigarette|vape|beer|wine)\b/gi,
      },
      profanity: {
        high: /\b(fuck|motherfucker|cunt|cocksucker)\b/gi,
        medium:
          /\b(shit|bitch|asshole|bastard|goddamn|dickhead|whore|slut)\b/gi,
        low: /\b(damn|crap|piss|hell|bloody|wtf|stfu|gtfo)\b/gi,
      },
      strangerDanger: {
        critical:
          /\b(meet (me|up)|let's meet|come over|don't tell (your parents|anyone)|this is our secret|adults don't need to know)\b/gi,
        high: /\b(send me your|what's your address|where do you live|how old are you|are you alone)\b/gi,
        medium: /\b(age\/sex\/location|a\/s\/l|send pic|photo of you)\b/gi,
      },
    };

    // Process patterns in parallel for better performance
    const patternResults = await Promise.all(
      Object.entries(patterns).map(async ([category, patternSet]) => {
        const categoryResults: { level: string; matches: number }[] = [];
        for (const [level, pattern] of Object.entries(patternSet)) {
          const matches = content.match(pattern);
          categoryResults.push({ level, matches: matches?.length || 0 });
        }
        return { category, results: categoryResults };
      }),
    );

    // Calculate risk score based on pattern matches
    patternResults.forEach(({ category, results }) => {
      results.forEach(({ level, matches }) => {
        if (matches > 0) {
          let severityMultiplier = 1;
          switch (level) {
            case "critical":
              severityMultiplier = 4;
              break;
            case "high":
              severityMultiplier = 3;
              break;
            case "medium":
              severityMultiplier = 2;
              break;
            case "low":
              severityMultiplier = 1;
              break;
          }

          switch (category) {
            case "violence":
              riskScore += matches * 15 * severityMultiplier;
              flags.push(`violence_${level}`);
              break;
            case "selfHarm":
              riskScore += matches * 25 * severityMultiplier;
              flags.push(`self_harm_${level}`);
              break;
            case "personalInfo":
              riskScore += matches * 20 * severityMultiplier;
              flags.push(`personal_information_${level}`);
              break;
            case "bullying":
              riskScore += matches * 12 * severityMultiplier;
              flags.push(`bullying_${level}`);
              break;
            case "inappropriate":
              riskScore += matches * 8 * severityMultiplier;
              flags.push(`inappropriate_content_${level}`);
              break;
            case "profanity":
              riskScore += matches * 10 * severityMultiplier;
              flags.push(`profanity_${level}`);
              break;
            case "strangerDanger":
              riskScore += matches * 30 * severityMultiplier;
              flags.push(`stranger_danger_${level}`);
              break;
          }
        }
      });
    });

    // Determine status based on risk score
    let status: ModerationResult["status"];
    let requiresHumanReview = false;

    if (riskScore >= 25 || flags.some((f) => f.includes("self_harm"))) {
      status = "rejected";
      requiresHumanReview = true;
      confidence = 0.95;
    } else if (
      riskScore >= 15 ||
      flags.some((f) => f.includes("violence")) ||
      flags.some((f) => f.includes("personal_information"))
    ) {
      status = "pending_review";
      requiresHumanReview = true;
      confidence = 0.85;
    } else if (riskScore >= 5) {
      status = "flagged";
      confidence = 0.75;
    } else {
      status = "approved";
      confidence = 0.9;
    }

    return {
      status,
      riskScore,
      flags,
      confidence,
      processingTime: Date.now() - startTime,
      requiresHumanReview,
    };
  }

  // Cache management
  private getCachedResult(content: string): ModerationResult | null {
    if (!this.config.enableCache) return null;

    const contentHash = this.hashContent(content);
    const cached = this.cache.get(contentHash);

    if (cached) {
      const isExpired =
        Date.now() - cached.timestamp >
        this.config.cacheExpiryMinutes * 60 * 1000;
      if (!isExpired) {
        return { ...cached.result, processingTime: 1 }; // Cache hit
      } else {
        this.cache.delete(contentHash);
      }
    }

    return null;
  }

  private setCachedResult(content: string, result: ModerationResult): void {
    if (!this.config.enableCache) return;

    const contentHash = this.hashContent(content);
    this.cache.set(contentHash, {
      result,
      timestamp: Date.now(),
    });
  }

  private hashContent(content: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // OpenAI Moderation API integration
  private async moderateWithOpenAI(
    content: string,
  ): Promise<{ riskScore: number; flags: string[]; confidence: number }> {
    if (!this.externalConfig.openai.enabled) {
      return { riskScore: 0, flags: [], confidence: 0 };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.externalConfig.openai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: content,
          model: "text-moderation-latest",
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.results[0];

      let riskScore = 0;
      const flags: string[] = [];

      // Map OpenAI categories to our flags
      const categoryMap = {
        hate: { flag: "hate_speech", score: 15 },
        "hate/threatening": { flag: "violence_threats", score: 20 },
        harassment: { flag: "bullying", score: 12 },
        "harassment/threatening": { flag: "violence_threats", score: 18 },
        "self-harm": { flag: "self_harm", score: 25 },
        "self-harm/intent": { flag: "self_harm", score: 30 },
        "self-harm/instructions": { flag: "self_harm", score: 25 },
        sexual: { flag: "inappropriate_content", score: 20 },
        "sexual/minors": { flag: "inappropriate_content", score: 30 },
        violence: { flag: "violence", score: 18 },
        "violence/graphic": { flag: "violence", score: 22 },
      };

      Object.entries(result.categories).forEach(([category, flagged]) => {
        if (flagged && categoryMap[category as keyof typeof categoryMap]) {
          const mapping = categoryMap[category as keyof typeof categoryMap];
          flags.push(mapping.flag);
          riskScore += mapping.score;
        }
      });

      return {
        riskScore,
        flags,
        confidence: result.flagged ? 0.95 : 0.85,
      };
    } catch (error) {
      console.error("OpenAI moderation error:", error);
      return { riskScore: 0, flags: [], confidence: 0 };
    }
  }

  // Google Perspective API integration for toxicity detection
  private async moderateWithPerspective(
    content: string,
  ): Promise<{ riskScore: number; flags: string[]; confidence: number }> {
    if (!this.externalConfig.perspective.enabled) {
      return { riskScore: 0, flags: [], confidence: 0 };
    }

    try {
      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.externalConfig.perspective.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              INSULT: {},
              PROFANITY: {},
              THREAT: {},
              SEXUALLY_EXPLICIT: {},
              FLIRTATION: {},
            },
            comment: { text: content },
            languages: ["en"],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Perspective API error: ${response.status}`);
      }

      const data = await response.json();
      const scores = data.attributeScores;

      let riskScore = 0;
      const flags: string[] = [];

      // Map Perspective scores to our system
      const scoreThreshold = 0.7; // Threshold for flagging

      if (scores.TOXICITY?.summaryScore?.value > scoreThreshold) {
        riskScore += 10;
        flags.push("toxicity");
      }

      if (scores.SEVERE_TOXICITY?.summaryScore?.value > scoreThreshold) {
        riskScore += 20;
        flags.push("severe_toxicity");
      }

      if (scores.IDENTITY_ATTACK?.summaryScore?.value > scoreThreshold) {
        riskScore += 15;
        flags.push("hate_speech");
      }

      if (scores.THREAT?.summaryScore?.value > scoreThreshold) {
        riskScore += 18;
        flags.push("violence_threats");
      }

      if (scores.SEXUALLY_EXPLICIT?.summaryScore?.value > scoreThreshold) {
        riskScore += 20;
        flags.push("inappropriate_content");
      }

      if (scores.PROFANITY?.summaryScore?.value > scoreThreshold) {
        riskScore += 8;
        flags.push("profanity");
      }

      return {
        riskScore,
        flags,
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Perspective API error:", error);
      return { riskScore: 0, flags: [], confidence: 0 };
    }
  }

  // Google Vision API for image moderation
  private async moderateImageWithVision(
    imageUrl: string,
  ): Promise<{ riskScore: number; flags: string[]; confidence: number }> {
    if (!this.externalConfig.googleVision.enabled) {
      return { riskScore: 0, flags: [], confidence: 0 };
    }

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.externalConfig.googleVision.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  source: { imageUri: imageUrl },
                },
                features: [
                  { type: "SAFE_SEARCH_DETECTION" },
                  { type: "TEXT_DETECTION" },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.responses[0];

      let riskScore = 0;
      const flags: string[] = [];

      // Check SafeSearch results
      if (result.safeSearchAnnotation) {
        const safeSearch = result.safeSearchAnnotation;

        // Map likelihood levels to risk scores
        const likelihoodScores = {
          VERY_UNLIKELY: 0,
          UNLIKELY: 1,
          POSSIBLE: 3,
          LIKELY: 8,
          VERY_LIKELY: 15,
        };

        if (safeSearch.adult && likelihoodScores[safeSearch.adult] > 3) {
          riskScore += likelihoodScores[safeSearch.adult];
          flags.push("inappropriate_content");
        }

        if (safeSearch.violence && likelihoodScores[safeSearch.violence] > 3) {
          riskScore += likelihoodScores[safeSearch.violence];
          flags.push("violence");
        }

        if (safeSearch.racy && likelihoodScores[safeSearch.racy] > 3) {
          riskScore += likelihoodScores[safeSearch.racy];
          flags.push("inappropriate_content");
        }
      }

      // Check for text in images and moderate that too
      if (result.textAnnotations && result.textAnnotations.length > 0) {
        const detectedText = result.textAnnotations[0].description;
        if (detectedText) {
          const textModeration = await this.moderateWithOpenAI(detectedText);
          riskScore += textModeration.riskScore * 0.5; // Reduce weight for text in images
          flags.push(...textModeration.flags.map((f) => `image_text_${f}`));
        }
      }

      return {
        riskScore,
        flags,
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Google Vision API error:", error);
      return { riskScore: 0, flags: [], confidence: 0 };
    }
  }

  // Main moderation method
  async moderateContent(
    content: string,
    userId: string,
    type: string,
  ): Promise<ModerationResult> {
    // Check cache first
    const cachedResult = this.getCachedResult(content);
    if (cachedResult) {
      return cachedResult;
    }

    // Try fast-track moderation first
    const fastResult = await this.fastTrackModeration(content);
    if (fastResult) {
      this.setCachedResult(content, fastResult);
      await this.logModerationResult(userId, type, content, fastResult);
      return fastResult;
    }

    // Use comprehensive moderation with external APIs
    let result = await this.comprehensiveModeration(content);

    // Enhance with external APIs if enabled
    if (this.config.enableMLModeration) {
      const [openaiResult, perspectiveResult] = await Promise.all([
        this.moderateWithOpenAI(content),
        this.moderateWithPerspective(content),
      ]);

      // Combine results from different APIs
      const combinedRiskScore =
        result.riskScore +
        openaiResult.riskScore * 0.4 +
        perspectiveResult.riskScore * 0.3;

      const combinedFlags = [
        ...result.flags,
        ...openaiResult.flags.map((f) => `openai_${f}`),
        ...perspectiveResult.flags.map((f) => `perspective_${f}`),
      ];

      const avgConfidence =
        (result.confidence +
          openaiResult.confidence +
          perspectiveResult.confidence) /
        3;

      // Update status based on enhanced scoring
      let status: ModerationResult["status"] = result.status;
      let requiresHumanReview = result.requiresHumanReview;

      if (
        combinedRiskScore >= 25 ||
        combinedFlags.some((f) => f.includes("self_harm"))
      ) {
        status = "rejected";
        requiresHumanReview = true;
      } else if (combinedRiskScore >= 15) {
        status = "pending_review";
        requiresHumanReview = true;
      } else if (combinedRiskScore >= 5) {
        status = "flagged";
      } else {
        status = "approved";
      }

      result = {
        ...result,
        status,
        riskScore: Math.round(combinedRiskScore),
        flags: [...new Set(combinedFlags)],
        confidence: avgConfidence,
        requiresHumanReview,
      };
    }

    // If no violations found and low risk score, approve automatically
    if (result.riskScore === 0 && result.flags.length === 0) {
      result.status = "approved";
      result.requiresHumanReview = false;
    }

    this.setCachedResult(content, result);
    await this.logModerationResult(userId, type, content, result);

    return result;
  }

  private async logModerationResult(
    userId: string,
    type: string,
    content: string,
    result: ModerationResult,
  ): Promise<void> {
    try {
      if (!prisma) {
        console.warn("Prisma client not available for moderation logging");
        return;
      }

      await prisma.moderationLog.create({
        data: {
          userId,
          contentType: type,
          content: content.substring(0, 1000),
          status: result.status,
          riskScore: result.riskScore,
          flags: result.flags,
          reason: result.reason || `Risk score: ${result.riskScore}`,
          requiresHumanReview: result.requiresHumanReview,
        },
      });
    } catch (error) {
      console.error("Failed to log moderation result:", error);
      // Continue processing even if logging fails
    }
  }
  // If no violations found, approve the content

  // If no violations found, approve the content
}

export const moderationService = new OptimizedModerationService();

// Performance metrics
export const getModerationMetrics = () => {
  const service = moderationService as any;
  return {
    cacheSize: service.cache.size,
    cacheHitRate:
      service.cacheHits / (service.cacheHits + service.cacheMisses) || 0,
    fastTrackRate: service.fastTrackApprovals / service.totalRequests || 0,
    averageProcessingTime:
      service.totalProcessingTime / service.totalRequests || 0,
  };
};
