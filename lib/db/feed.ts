
'use server'

import { prisma } from '../prisma'

export async function getFeedPosts() {
  try {
    const posts = await prisma.feedPost.findMany({
      include: {
        author: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return posts.map(post => ({
      id: post.id,
      type: 'post',
      author: {
        id: post.author.id,
        name: `${post.author.firstName} ${post.author.lastName}`,
        role: post.author.role,
        avatar: post.author.profileImageUrl,
        verified: true
      },
      content: post.content,
      media: post.imageUrl ? [post.imageUrl] : [],
      likes: post.likesCount,
      comments: post.commentsCount,
      timestamp: new Date(post.createdAt).toLocaleString(),
      isPinned: false
    }))
  } catch (error) {
    console.error('Error fetching feed:', error)
    return []
  }
}
