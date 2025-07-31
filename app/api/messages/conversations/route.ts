
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // For now, return mock conversations
    // This would be replaced with actual database queries
    const conversations = [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        avatar: "/diverse-female-student.png",
        lastMessage: "Great question about quantum physics!",
        timestamp: "2 min ago",
        unread: 2,
        isOnline: true,
        type: "direct"
      },
      {
        id: "2",
        name: "Study Group - Mathematics",
        lastMessage: "Alice: Anyone free for study session?",
        timestamp: "15 min ago",
        unread: 0,
        isOnline: false,
        type: "group"
      }
    ];

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
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
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const { participantIds, isGroup, name } = await request.json();

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: "Participants are required" },
        { status: 400 }
      );
    }

    // TODO: Create conversation in database
    // This is a placeholder response
    const newConversation = {
      id: Date.now().toString(),
      name: name || "New Conversation",
      participants: participantIds,
      createdBy: user.id,
      isGroup: isGroup || false,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ conversation: newConversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
