
'use server'

import { prisma } from '../prisma'

export async function getStudentProfile(studentId: string) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        educationHistory: {
          include: {
            institution: {
              include: {
                profile: true
              }
            },
            institutionType: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    })

    // Debug log verification status for each education record
    if (student?.educationHistory) {
      console.log('🔍 RAW Student DB query result:', JSON.stringify(student.educationHistory, null, 2));
      student.educationHistory.forEach(edu => {
        console.log('🔍 Student DB verification status:', {
          institution: edu.institutionName,
          institutionVerified: edu.institutionVerified,
          type: typeof edu.institutionVerified,
          hasProperty: Object.prototype.hasOwnProperty.call(edu, 'institutionVerified'),
          allKeys: Object.keys(edu)
        });
      });
    }

    return student
  } catch (error) {
    console.error(`Error fetching student profile ${studentId}:`, error)
    return null
  }
}

export async function addStudentEducation(studentId: string, educationData: {
  institutionName: string
  institutionTypeId?: string
  degreeProgram?: string
  fieldOfStudy?: string
  startDate?: Date
  endDate?: Date
  isCurrent?: boolean
  gradeLevel?: string
  gpa?: string
  achievements?: string
  description?: string
}) {
  try {
    const education = await prisma.studentEducationHistory.create({
      data: {
        studentId,
        ...educationData
      },
      include: {
        institutionType: {
          include: {
            category: true
          }
        }
      }
    })

    return education
  } catch (error) {
    console.error('Error adding student education:', error)
    throw error
  }
}

export async function updateStudentEducation(educationId: string, educationData: {
  institutionName?: string
  institutionTypeId?: string
  degreeProgram?: string
  fieldOfStudy?: string
  startDate?: Date
  endDate?: Date
  isCurrent?: boolean
  gradeLevel?: string
  gpa?: string
  achievements?: string
  description?: string
}) {
  try {
    const education = await prisma.studentEducationHistory.update({
      where: { id: educationId },
      data: educationData,
      include: {
        institutionType: {
          include: {
            category: true
          }
        }
      }
    })

    return education
  } catch (error) {
    console.error('Error updating student education:', error)
    throw error
  }
}

export async function deleteStudentEducation(educationId: string) {
  try {
    await prisma.studentEducationHistory.delete({
      where: { id: educationId }
    })

    return true
  } catch (error) {
    console.error('Error deleting student education:', error)
    throw error
  }
}

export async function getInstitutionTypes() {
  try {
    const categories = await prisma.institutionCategory.findMany({
      include: {
        types: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return categories
  } catch (error) {
    console.error('Error fetching institution types:', error)
    return []
  }
}
