

// Achievement type data with unique icons and colors for each type
export const ACHIEVEMENT_TYPE_DATA: { [key: number]: { icon: string; color: string; name: string } } = {
  // Academic Excellence (Category 21) - IDs 161-168
  161: { icon: "🎖️", color: "#3B82F6", name: "Honor Roll" }, // Blue
  162: { icon: "🎓", color: "#3B82F6", name: "Dean's List" },
  163: { icon: "💰", color: "#F59E0B", name: "Academic Scholarship" }, // Amber
  164: { icon: "📅", color: "#10B981", name: "Perfect Attendance" }, // Emerald
  165: { icon: "🥇", color: "#F59E0B", name: "Subject Topper" },
  166: { icon: "📄", color: "#6366F1", name: "Research Publication" }, // Indigo
  167: { icon: "🏅", color: "#F59E0B", name: "Academic Award" },
  168: { icon: "📜", color: "#8B5CF6", name: "Merit Certificate" }, // Violet
  
  // Sports & Athletics (Category 22) - IDs 169-176
  169: { icon: "🏆", color: "#F59E0B", name: "Championship Winner" },
  170: { icon: "🏃‍♂️", color: "#10B981", name: "Tournament Participation" },
  171: { icon: "🎯", color: "#F59E0B", name: "Sports Scholarship" },
  172: { icon: "👑", color: "#EF4444", name: "Team Captain" }, // Red
  173: { icon: "📊", color: "#10B981", name: "Personal Best Record" },
  174: { icon: "🥉", color: "#F59E0B", name: "Sports Award" },
  175: { icon: "⚽", color: "#10B981", name: "Athletic Achievement" },
  176: { icon: "💪", color: "#EF4444", name: "Fitness Milestone" },
  
  // Arts & Creativity (Category 23) - IDs 177-184
  177: { icon: "🎨", color: "#EC4899", name: "Art Competition Winner" }, // Pink
  178: { icon: "🖼️", color: "#8B5CF6", name: "Creative Project" },
  179: { icon: "🎭", color: "#EC4899", name: "Performance Award" },
  180: { icon: "🖌️", color: "#8B5CF6", name: "Art Exhibition" },
  181: { icon: "🎵", color: "#EC4899", name: "Music Competition" },
  182: { icon: "💃", color: "#EC4899", name: "Dance Performance" },
  183: { icon: "✍️", color: "#6366F1", name: "Creative Writing" },
  184: { icon: "📸", color: "#8B5CF6", name: "Photography Award" },
  
  // Leadership & Service (Category 24) - IDs 185-192
  185: { icon: "🏛️", color: "#EF4444", name: "Student Council" },
  186: { icon: "👨‍💼", color: "#F59E0B", name: "Club President" },
  187: { icon: "🤝", color: "#10B981", name: "Volunteer Service" },
  188: { icon: "👥", color: "#3B82F6", name: "Community Leader" },
  189: { icon: "🎖️", color: "#EF4444", name: "Mentorship Award" },
  190: { icon: "⏰", color: "#10B981", name: "Service Hours" },
  191: { icon: "📋", color: "#6366F1", name: "Leadership Certificate" },
  192: { icon: "💡", color: "#F59E0B", name: "Social Initiative" },
  
  // Skills & Certifications (Category 25) - IDs 193-200
  193: { icon: "📊", color: "#3B82F6", name: "Professional Certification" },
  194: { icon: "📝", color: "#6366F1", name: "Skill Assessment" },
  195: { icon: "✅", color: "#10B981", name: "Course Completion" },
  196: { icon: "📚", color: "#8B5CF6", name: "Training Certificate" },
  197: { icon: "🆔", color: "#EF4444", name: "License Achievement" },
  198: { icon: "🏷️", color: "#EC4899", name: "Competency Badge" },
  199: { icon: "🛠️", color: "#F59E0B", name: "Workshop Completion" },
  200: { icon: "👍", color: "#10B981", name: "Skill Endorsement" },
  
  // Competition & Contest (Category 26) - IDs 201-208
  201: { icon: "❓", color: "#6366F1", name: "Quiz Competition" },
  202: { icon: "🗣️", color: "#EF4444", name: "Debate Winner" },
  203: { icon: "🔬", color: "#10B981", name: "Science Fair" },
  204: { icon: "💻", color: "#8B5CF6", name: "Hackathon Winner" },
  205: { icon: "🥈", color: "#F59E0B", name: "Olympiad Medal" },
  206: { icon: "🎪", color: "#EC4899", name: "Contest Participation" },
  207: { icon: "🏵️", color: "#F59E0B", name: "Competition Award" },
  208: { icon: "🎲", color: "#EF4444", name: "Challenge Winner" },
  
  // Personal Development (Category 27) - IDs 209-216
  209: { icon: "🎯", color: "#EF4444", name: "Goal Achievement" },
  210: { icon: "📍", color: "#10B981", name: "Personal Milestone" },
  211: { icon: "🔄", color: "#3B82F6", name: "Habit Formation" },
  212: { icon: "📈", color: "#10B981", name: "Self Improvement" },
  213: { icon: "🧠", color: "#6366F1", name: "Learning Goal" },
  214: { icon: "🏋️‍♂️", color: "#EF4444", name: "Personal Challenge" },
  215: { icon: "🌱", color: "#10B981", name: "Growth Milestone" },
  216: { icon: "🔓", color: "#F59E0B", name: "Achievement Unlocked" },
  
  // Technology & Innovation (Category 28) - IDs 217-224
  217: { icon: "⌨️", color: "#8B5CF6", name: "Coding Project" },
  218: { icon: "📱", color: "#6366F1", name: "App Development" },
  219: { icon: "🚀", color: "#F59E0B", name: "Innovation Award" },
  220: { icon: "🖥️", color: "#3B82F6", name: "Tech Competition" },
  221: { icon: "📋", color: "#EC4899", name: "Patent Filed" },
  222: { icon: "🎤", color: "#8B5CF6", name: "Technical Presentation" },
  223: { icon: "💻", color: "#6366F1", name: "Programming Achievement" },
  224: { icon: "🎨", color: "#F59E0B", name: "Digital Creation" },
  
  // Community & Social Impact (Category 29) - IDs 225-232
  225: { icon: "🌍", color: "#10B981", name: "Social Project" },
  226: { icon: "🤝", color: "#3B82F6", name: "Community Service" },
  227: { icon: "💰", color: "#F59E0B", name: "Fundraising Success" },
  228: { icon: "📢", color: "#EC4899", name: "Awareness Campaign" },
  229: { icon: "🌱", color: "#10B981", name: "Environmental Initiative" },
  230: { icon: "🏆", color: "#EF4444", name: "Social Impact Award" },
  231: { icon: "❤️", color: "#EC4899", name: "Charity Work" },
  232: { icon: "🏅", color: "#8B5CF6", name: "Community Recognition" },
  
  // Cultural & Language (Category 30) - IDs 233-240
  233: { icon: "🗣️", color: "#6366F1", name: "Language Proficiency" },
  234: { icon: "🎭", color: "#EC4899", name: "Cultural Performance" },
  235: { icon: "🗣️", color: "#F59E0B", name: "Language Competition" },
  236: { icon: "🏆", color: "#8B5CF6", name: "Cultural Award" },
  237: { icon: "📝", color: "#3B82F6", name: "Translation Work" },
  238: { icon: "🌍", color: "#10B981", name: "Cultural Exchange" },
  239: { icon: "🏛️", color: "#EF4444", name: "Heritage Project" },
  240: { icon: "🌐", color: "#6366F1", name: "Multilingual Achievement" },
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

