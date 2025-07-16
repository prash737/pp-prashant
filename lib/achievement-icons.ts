
// Achievement type data with unique icons and colors for each type
export const ACHIEVEMENT_TYPE_DATA: { [key: number]: { icon: string; color: string; name: string } } = {
  // Academic (Category 1)
  1: { icon: "🎖️", color: "#3B82F6", name: "Honor Roll" }, // Blue
  2: { icon: "🎓", color: "#3B82F6", name: "Dean's List" },
  3: { icon: "💰", color: "#F59E0B", name: "Academic Scholarship" }, // Amber
  4: { icon: "📅", color: "#10B981", name: "Perfect Attendance" }, // Emerald
  5: { icon: "🥇", color: "#F59E0B", name: "Subject Topper" },
  6: { icon: "📄", color: "#6366F1", name: "Research Publication" }, // Indigo
  7: { icon: "🏅", color: "#F59E0B", name: "Academic Award" },
  8: { icon: "📜", color: "#8B5CF6", name: "Merit Certificate" }, // Violet
  
  // Sports (Category 2)
  9: { icon: "🏆", color: "#F59E0B", name: "Championship Winner" },
  10: { icon: "🏃‍♂️", color: "#10B981", name: "Tournament Participation" },
  11: { icon: "🎯", color: "#F59E0B", name: "Sports Scholarship" },
  12: { icon: "👑", color: "#EF4444", name: "Team Captain" }, // Red
  13: { icon: "📊", color: "#10B981", name: "Personal Best Record" },
  14: { icon: "🥉", color: "#F59E0B", name: "Sports Award" },
  15: { icon: "⚽", color: "#10B981", name: "Athletic Achievement" },
  16: { icon: "💪", color: "#EF4444", name: "Fitness Milestone" },
  
  // Arts & Creativity (Category 3)
  17: { icon: "🎨", color: "#EC4899", name: "Art Competition Winner" }, // Pink
  18: { icon: "🖼️", color: "#8B5CF6", name: "Creative Project" },
  19: { icon: "🎭", color: "#EC4899", name: "Performance Award" },
  20: { icon: "🖌️", color: "#8B5CF6", name: "Art Exhibition" },
  21: { icon: "🎵", color: "#EC4899", name: "Music Competition" },
  22: { icon: "💃", color: "#EC4899", name: "Dance Performance" },
  23: { icon: "✍️", color: "#6366F1", name: "Creative Writing" },
  24: { icon: "📸", color: "#8B5CF6", name: "Photography Award" },
  
  // Leadership (Category 4)
  25: { icon: "🏛️", color: "#EF4444", name: "Student Council" },
  26: { icon: "👨‍💼", color: "#F59E0B", name: "Club President" },
  27: { icon: "🤝", color: "#10B981", name: "Volunteer Service" },
  28: { icon: "👥", color: "#3B82F6", name: "Community Leader" },
  29: { icon: "🎖️", color: "#EF4444", name: "Mentorship Award" },
  30: { icon: "⏰", color: "#10B981", name: "Service Hours" },
  31: { icon: "📋", color: "#6366F1", name: "Leadership Certificate" },
  32: { icon: "💡", color: "#F59E0B", name: "Social Initiative" },
  
  // Professional Skills (Category 5)
  33: { icon: "📊", color: "#3B82F6", name: "Professional Certification" },
  34: { icon: "📝", color: "#6366F1", name: "Skill Assessment" },
  35: { icon: "✅", color: "#10B981", name: "Course Completion" },
  36: { icon: "📚", color: "#8B5CF6", name: "Training Certificate" },
  37: { icon: "🆔", color: "#EF4444", name: "License Achievement" },
  38: { icon: "🏷️", color: "#EC4899", name: "Competency Badge" },
  39: { icon: "🛠️", color: "#F59E0B", name: "Workshop Completion" },
  40: { icon: "👍", color: "#10B981", name: "Skill Endorsement" },
  
  // Competitions (Category 6)
  41: { icon: "❓", color: "#6366F1", name: "Quiz Competition" },
  42: { icon: "🗣️", color: "#EF4444", name: "Debate Winner" },
  43: { icon: "🔬", color: "#10B981", name: "Science Fair" },
  44: { icon: "💻", color: "#8B5CF6", name: "Hackathon Winner" },
  45: { icon: "🥈", color: "#F59E0B", name: "Olympiad Medal" },
  46: { icon: "🎪", color: "#EC4899", name: "Contest Participation" },
  47: { icon: "🏵️", color: "#F59E0B", name: "Competition Award" },
  48: { icon: "🎲", color: "#EF4444", name: "Challenge Winner" },
  
  // Personal Development (Category 7)
  49: { icon: "🎯", color: "#EF4444", name: "Goal Achievement" },
  50: { icon: "📍", color: "#10B981", name: "Personal Milestone" },
  51: { icon: "🔄", color: "#3B82F6", name: "Habit Formation" },
  52: { icon: "📈", color: "#10B981", name: "Self Improvement" },
  53: { icon: "🧠", color: "#6366F1", name: "Learning Goal" },
  54: { icon: "🏋️‍♂️", color: "#EF4444", name: "Personal Challenge" },
  55: { icon: "🌱", color: "#10B981", name: "Growth Milestone" },
  56: { icon: "🔓", color: "#F59E0B", name: "Achievement Unlocked" },
  
  // Technology & Innovation (Category 8)
  57: { icon: "⌨️", color: "#8B5CF6", name: "Coding Project" },
  58: { icon: "📱", color: "#6366F1", name: "App Development" },
  59: { icon: "🚀", color: "#F59E0B", name: "Innovation Award" },
  60: { icon: "🖥️", color: "#3B82F6", name: "Tech Competition" },
}

// Function to get default icon data for achievement type
export function getDefaultIconData(achievementTypeId: number): { icon: string; color: string; name: string } {
  return ACHIEVEMENT_TYPE_DATA[achievementTypeId] || { icon: "🏆", color: "#F59E0B", name: "Achievement" }
}

// Function to get just the icon (for backward compatibility)
export function getDefaultIcon(achievementTypeId: number): string {
  return getDefaultIconData(achievementTypeId).icon
}

// Function to create a circular badge component
export function createCircularBadge(achievementTypeId: number, size: number = 40): string {
  const data = getDefaultIconData(achievementTypeId)
  const fontSize = Math.floor(size * 0.5)
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, ${data.color}20, ${data.color}40);
      border: 2px solid ${data.color}30;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      box-shadow: 0 2px 8px ${data.color}20;
    ">
      ${data.icon}
    </div>
  `
}

// Function to convert emoji to SVG data URL for consistent display
export function emojiToDataUrl(emoji: string): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = 64
  canvas.height = 64
  
  if (ctx) {
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, 32, 32)
  }
  
  return canvas.toDataURL()
}
