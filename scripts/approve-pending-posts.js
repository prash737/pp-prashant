const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function approvePendingPosts() {
  try {
    console.log("🔄 Finding pending posts...");

    const pendingPosts = await prisma.feedPost.findMany({
      where: {
        moderationStatus: "pending_review",
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`📊 Found ${pendingPosts.length} pending posts`);

    if (pendingPosts.length === 0) {
      console.log("✅ No pending posts to approve");
      return;
    }

    // Approve all pending posts
    const result = await prisma.feedPost.updateMany({
      where: {
        moderationStatus: "pending_review",
      },
      data: {
        moderationStatus: "approved",
      },
    });

    console.log(`✅ Approved ${result.count} posts`);

    // Show which posts were approved
    pendingPosts.forEach((post) => {
      console.log(
        `   - Post ${post.id.substring(0, 8)} by ${post.author?.firstName} ${post.author?.lastName}`,
      );
    });
  } catch (error) {
    console.error("❌ Error approving posts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

approvePendingPosts();
