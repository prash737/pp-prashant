
# PathPiper Mock Data Structure

## Feed System

```json
{
  "feedItems": [
    {
      "id": "1",
      "type": "post",
      "author": {
        "id": "user1",
        "name": "Alex Johnson",
        "role": "student",
        "avatar": "/images/student-profile.png",
        "verified": true,
        "school": "Westlake High School"
      },
      "content": "Just finished my science project on renewable energy! 🔬 Check out the solar panel model I built for the science fair next week.",
      "media": ["/robotics-competition.png"],
      "tags": ["Science", "RenewableEnergy", "ProjectShowcase"],
      "likes": 24,
      "comments": 5,
      "shares": 2,
      "timestamp": "2 hours ago",
      "isPinned": false
    },
    {
      "id": "2",
      "type": "achievement",
      "title": "Math Champion",
      "subtitle": "First place in regional competition",
      "description": "I'm excited to share that I won first place in the regional math competition!",
      "backgroundImage": "/diverse-female-student.png",
      "author": {
        "name": "Emma Wilson",
        "avatar": "/diverse-female-student.png",
        "role": "Student",
        "school": "Riverdale High"
      },
      "stats": {
        "likes": 56,
        "comments": 12,
        "shares": 8
      }
    }
  ]
}
```

## Mentor Profiles

```json
{
  "mentor": {
    "bio": "I'm a Computer Science Professor at Stanford University with 15+ years of experience in AI and machine learning.",
    "education": [
      {
        "degree": "Ph.D. in Computer Science",
        "institution": "MIT",
        "year": "2008",
        "logo": "/placeholder.svg?height=40&width=40&query=MIT logo"
      }
    ],
    "technicalSkills": [
      {
        "name": "Machine Learning",
        "level": 95
      },
      {
        "name": "Computer Vision",
        "level": 90
      }
    ],
    "mentorshipAreas": [
      {
        "name": "Research Guidance",
        "icon": "BookOpen"
      },
      {
        "name": "Career Planning",
        "icon": "Briefcase"
      }
    ]
  }
}
```

## Institution Profiles

```json
{
  "institution": {
    "name": "Stanford University",
    "type": "University",
    "overview": "Stanford University, officially Leland Stanford Junior University, is a private research university in Stanford, California.",
    "stats": {
      "studentBody": {
        "undergraduate": 7645,
        "graduate": 9292
      },
      "faculty": 2288,
      "campusSize": "8,180 acres"
    },
    "contact": {
      "address": "450 Serra Mall, Stanford, CA 94305",
      "phone": "(650) 723-2300",
      "email": "admission@stanford.edu"
    }
  }
}
```

## Mentorship History

```json
{
  "mentorshipStats": {
    "totalMentees": 120,
    "activeMentees": 12,
    "completedPrograms": 108,
    "averageRating": 4.8,
    "totalHours": 1450,
    "successStories": 24
  },
  "activeMentorships": [
    {
      "menteeName": "Alex Johnson",
      "menteeImage": "/student-with-hat.png",
      "program": "Computer Science Research",
      "startDate": "March 2023",
      "progress": 65,
      "nextSession": "May 18, 2023"
    }
  ]
}
```

## Mentor Circles

```json
{
  "mentorCircles": [
    {
      "id": "cs-mentorship",
      "name": "CS Mentorship",
      "type": "Mentees",
      "members": 24,
      "description": "Current and former computer science students I'm mentoring",
      "image": "/multiple-monitor-coding.png",
      "color": "from-blue-500 to-cyan-400"
    }
  ]
}
```

## Institution Types

```json
{
  "categories": [
    {
      "id": "traditional",
      "label": "Traditional Educational Institutions",
      "types": [
        {
          "id": "university",
          "label": "University"
        },
        {
          "id": "college",
          "label": "College"
        }
      ]
    }
  ]
}
```

## Learning Paths and Skills

```json
{
  "ageAppropriateContent": {
    "professionalSkills": [
      "Project Management",
      "Strategic Planning",
      "Financial Analysis"
    ],
    "academicSkills": [
      "Research Methods",
      "Critical Thinking",
      "Academic Writing"
    ]
  }
}
```
