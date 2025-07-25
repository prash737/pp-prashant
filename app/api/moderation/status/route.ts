import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiStatus = {
      openai: {
        enabled: !!process.env.OPENAI_API_KEY,
        status: "unknown",
      },
      googleVision: {
        enabled: !!process.env.GOOGLE_VISION_API_KEY,
        status: "unknown",
      },
      perspective: {
        enabled: !!process.env.PERSPECTIVE_API_KEY,
        status: "unknown",
      },
      aws: {
        enabled: !!(
          process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ),
        status: "unknown",
      },
    };

    // Test OpenAI API
    if (apiStatus.openai.enabled) {
      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });
        apiStatus.openai.status = response.ok ? "online" : "error";
      } catch {
        apiStatus.openai.status = "error";
      }
    }

    // Test Google Vision API
    if (apiStatus.googleVision.enabled) {
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
                  image: {
                    content: "", // Empty test request
                  },
                  features: [{ type: "SAFE_SEARCH_DETECTION" }],
                },
              ],
            }),
          },
        );
        // A 400 error with empty content is expected and means API is reachable
        apiStatus.googleVision.status =
          response.status === 400 ? "online" : "error";
      } catch {
        apiStatus.googleVision.status = "error";
      }
    }

    // Test Perspective API
    if (apiStatus.perspective.enabled) {
      try {
        const response = await fetch(
          `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestedAttributes: { TOXICITY: {} },
              comment: { text: "test" },
            }),
          },
        );
        apiStatus.perspective.status = response.ok ? "online" : "error";
      } catch {
        apiStatus.perspective.status = "error";
      }
    }

    return NextResponse.json({
      success: true,
      apis: apiStatus,
      summary: {
        totalEnabled: Object.values(apiStatus).filter((api) => api.enabled)
          .length,
        totalOnline: Object.values(apiStatus).filter(
          (api) => api.status === "online",
        ).length,
      },
    });
  } catch (error) {
    console.error("Error checking API status:", error);
    return NextResponse.json(
      { error: "Failed to check API status" },
      { status: 500 },
    );
  }
}
