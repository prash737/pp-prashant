
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const institutionData = [
  {
    name: "Traditional Educational Institutions",
    slug: "traditional-educational",
    description: "Formal educational institutions following conventional academic structures",
    types: [
      { name: "Preschool/Kindergarten", slug: "preschool-kindergarten" },
      { name: "Primary School", slug: "primary-school" },
      { name: "Secondary/High School", slug: "secondary-high-school" },
      { name: "University", slug: "university" },
      { name: "College", slug: "college" },
      { name: "Community/Junior College", slug: "community-junior-college" },
      { name: "Polytechnic", slug: "polytechnic" },
      { name: "Vocational/Trade School", slug: "vocational-trade-school" }
    ]
  },
  {
    name: "Specialized Training & Coaching",
    slug: "specialized-training-coaching",
    description: "Institutions focused on specific skill development and professional training",
    types: [
      { name: "Career Coaching Center", slug: "career-coaching-center" },
      { name: "Professional Skills Training", slug: "professional-skills-training" },
      { name: "IT/Technical Training Institute", slug: "it-technical-training" },
      { name: "Competitive Exam Coaching", slug: "competitive-exam-coaching" },
      { name: "Test Preparation Center", slug: "test-preparation-center" },
      { name: "Subject Tutoring Center", slug: "subject-tutoring-center" },
      { name: "Language Institute", slug: "language-institute" },
      { name: "Soft Skills Development Center", slug: "soft-skills-development" }
    ]
  },
  {
    name: "Arts, Sports & Performance Education",
    slug: "arts-sports-performance",
    description: "Creative and physical education institutions",
    types: [
      { name: "Sports Academy/Athletic Training", slug: "sports-academy" },
      { name: "Music School/Conservatory", slug: "music-school" },
      { name: "Dance Academy", slug: "dance-academy" },
      { name: "Fine Arts Institution", slug: "fine-arts-institution" },
      { name: "Drama/Theater School", slug: "drama-theater-school" },
      { name: "Film and Media Academy", slug: "film-media-academy" },
      { name: "Martial Arts/Physical Training", slug: "martial-arts-training" },
      { name: "Yoga and Wellness Academy", slug: "yoga-wellness-academy" }
    ]
  },
  {
    name: "Special & Alternative Education",
    slug: "special-alternative-education",
    description: "Educational institutions serving special needs and alternative learning approaches",
    types: [
      { name: "Special Needs Education Center", slug: "special-needs-education" },
      { name: "Remedial Education Institution", slug: "remedial-education" },
      { name: "Gifted Education Program", slug: "gifted-education-program" },
      { name: "Therapeutic Education Center", slug: "therapeutic-education" },
      { name: "Montessori/Waldorf School", slug: "montessori-waldorf-school" },
      { name: "Homeschooling Support Center", slug: "homeschooling-support" },
      { name: "Alternative Education School", slug: "alternative-education-school" }
    ]
  },
  {
    name: "Government Educational Institutions",
    slug: "government-educational",
    description: "Public sector educational institutions and training centers",
    types: [
      { name: "Public School System Administration", slug: "public-school-system" },
      { name: "Government University/College", slug: "government-university" },
      { name: "Military/Defense Training Academy", slug: "military-defense-academy" },
      { name: "Civil Service Training Institute", slug: "civil-service-training" },
      { name: "Government Research Institution", slug: "government-research" },
      { name: "Public Vocational Training Center", slug: "public-vocational-training" },
      { name: "Government Sports Authority", slug: "government-sports-authority" }
    ]
  },
  {
    name: "Non-Governmental Organizations",
    slug: "non-governmental-organizations",
    description: "NGOs and non-profit organizations focused on education",
    types: [
      { name: "Educational NGO", slug: "educational-ngo" },
      { name: "Skill Development Organization", slug: "skill-development-org" },
      { name: "Literacy Program Provider", slug: "literacy-program-provider" },
      { name: "Educational Resource Provider", slug: "educational-resource-provider" },
      { name: "Community Learning Center", slug: "community-learning-center" },
      { name: "International Education Organization", slug: "international-education-org" },
      { name: "Special Needs Support Organization", slug: "special-needs-support-org" }
    ]
  },
  {
    name: "Modern Learning Environments",
    slug: "modern-learning-environments",
    description: "Technology-enabled and innovative learning platforms",
    types: [
      { name: "Online Learning Platform", slug: "online-learning-platform" },
      { name: "Blended Learning Provider", slug: "blended-learning-provider" },
      { name: "Continuing Education Center", slug: "continuing-education-center" },
      { name: "Educational Technology Provider", slug: "educational-technology-provider" },
      { name: "Massive Open Online Course (MOOC) Provider", slug: "mooc-provider" },
      { name: "Virtual School", slug: "virtual-school" },
      { name: "Microlearning Platform", slug: "microlearning-platform" }
    ]
  },
  {
    name: "Other Educational Institutions",
    slug: "other-educational",
    description: "Miscellaneous educational and training organizations",
    types: [
      { name: "Corporate Training Department", slug: "corporate-training-department" },
      { name: "Independent Research Institute", slug: "independent-research-institute" },
      { name: "Educational Think Tank", slug: "educational-think-tank" },
      { name: "Educational Publishing Organization", slug: "educational-publishing-org" },
      { name: "Educational Assessment Provider", slug: "educational-assessment-provider" },
      { name: "Other (Not Listed)", slug: "other-not-listed" }
    ]
  }
]

async function seedInstitutionTypes() {
  console.log('🌱 Seeding institution categories and types...')

  for (const categoryData of institutionData) {
    console.log(`📂 Creating category: ${categoryData.name}`)
    
    const category = await prisma.institutionCategory.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description
      }
    })

    for (const typeData of categoryData.types) {
      console.log(`  📄 Creating type: ${typeData.name}`)
      
      await prisma.institutionType.upsert({
        where: { 
          categoryId_slug: {
            categoryId: category.id,
            slug: typeData.slug
          }
        },
        update: {},
        create: {
          categoryId: category.id,
          name: typeData.name,
          slug: typeData.slug
        }
      })
    }
  }

  console.log('✅ Institution types seeding completed!')
}

export default seedInstitutionTypes

if (require.main === module) {
  seedInstitutionTypes()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
