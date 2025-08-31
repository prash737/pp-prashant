
export const api = {
  get: async (url: string) => {
    const response = await fetch(url)
    return response.json()
  },
  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

export const fetchStudentProfile = async (studentId: string) => {
  const response = await fetch(`/api/student/profile/${studentId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch student profile')
  }
  return response.json()
}
