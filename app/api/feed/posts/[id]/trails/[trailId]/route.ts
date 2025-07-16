
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> }
) {
  try {
    const { id: postId, trailId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get the trail to check ownership
    const trail = await prisma.feedPost.findFirst({
      where: {
        id: trailId,
        parentPostId: postId,
        isTrail: true
      }
    })

    if (!trail) {
      return NextResponse.json({ error: "Trail not found" }, { status: 404 })
    }

    // Check if user owns the trail
    if (trail.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this trail" }, { status: 403 })
    }

    // Delete the trail
    await prisma.feedPost.delete({
      where: { id: trailId }
    })

    // Reorder remaining trails
    const remainingTrails = await prisma.feedPost.findMany({
      where: {
        parentPostId: postId,
        isTrail: true
      },
      orderBy: { trailOrder: 'asc' }
    })

    // Update trail orders
    for (let i = 0; i < remainingTrails.length; i++) {
      await prisma.feedPost.update({
        where: { id: remainingTrails[i].id },
        data: { trailOrder: i + 1 }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trail:', error)
    return NextResponse.json({ error: "Failed to delete trail" }, { status: 500 })
  }
}
