
import { PrismaClient } from '@prisma/client'
import { INTEREST_CATEGORIES_BY_AGE, SKILL_CATEGORIES_BY_AGE } from '../data/age-appropriate-content'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding interests and skills data...')

  // Clear existing data first
  await prisma.userInterest.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.interest.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.interestCategory.deleteMany()
  await prisma.skillCategory.deleteMany()

  // Seed Interest Categories and Interests
  for (const [ageGroup, categories] of Object.entries(INTEREST_CATEGORIES_BY_AGE)) {
    for (const category of categories) {
      // Create interest category
      const interestCategory = await prisma.interestCategory.create({
        data: {
          name: category.name,
          ageGroup: ageGroup.replace('-', '_') as any, // Convert kebab-case to snake_case for enum
        },
      })

      // Create interests for this category
      for (const interestName of category.interests) {
        await prisma.interest.create({
          data: {
            name: interestName,
            categoryId: interestCategory.id,
          },
        })
      }
    }
  }

  // Seed Skill Categories and Skills
  for (const [ageGroup, categories] of Object.entries(SKILL_CATEGORIES_BY_AGE)) {
    for (const category of categories) {
      // Create skill category
      const skillCategory = await prisma.skillCategory.create({
        data: {
          name: category.name,
          ageGroup: ageGroup.replace('-', '_') as any, // Convert kebab-case to snake_case for enum
        },
      })

      // Create skills for this category
      for (const skillName of category.skills) {
        await prisma.skill.create({
          data: {
            name: skillName,
            categoryId: skillCategory.id,
          },
        })
      }
    }
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
