
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ following: [] });
    }

    const followingConnections = await prisma.institutionFollowConnection.findMany({
      where: {
        senderId: studentId
      },
      include: {
        receiver: {
          include: {
            institution: {
              include: {
                institutionTypeRef: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        connectedAt: 'desc'
      }
    });

    const following = followingConnections.map(connection => ({
      id: connection.receiver.id,
      name: connection.receiver.institution?.institutionName || 'Unknown Institution',
      type: connection.receiver.institution?.institutionType || 'Unknown',
      category: connection.receiver.institution?.institutionTypeRef?.category?.name || 'Unknown',
      location: connection.receiver.location || connection.receiver.institution?.location || 'Unknown',
      logo: connection.receiver.profileImageUrl || connection.receiver.institution?.logoUrl || '/images/pathpiper-logo.png',
      verified: connection.receiver.institution?.verified || false,
      connectedAt: connection.connectedAt
    }));

    return NextResponse.json({ following });

  } catch (error) {
    console.error('Public student following fetch error:', error);
    return NextResponse.json({ following: [] });
  }
}
