import { Sparkles } from "lucide-react"

export function Recommendations() {
  return (
    <section className="mb-10">
      <div className="flex items-center mb-4">
        <Sparkles className="text-yellow-500 mr-2" size={20} />
        <h2 className="text-xl font-semibold">Recommended For You</h2>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-medium mb-3">Based on your interests in Mathematics and Computer Science</h3>
        <p className="text-gray-600 mb-4">
          We've curated some personalized recommendations to help you continue your learning journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-purple-600 font-medium mb-1">Mentor</div>
            <h4 className="font-medium mb-2">Dr. Alan Turing</h4>
            <p className="text-sm text-gray-600 mb-3">Expert in Computer Science, Algorithms, and AI</p>
            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium py-1.5 rounded transition-colors">
              Connect
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-teal-600 font-medium mb-1">Course</div>
            <h4 className="font-medium mb-2">Advanced Algorithms</h4>
            <p className="text-sm text-gray-600 mb-3">Learn complex algorithms and problem-solving techniques</p>
            <button className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-medium py-1.5 rounded transition-colors">
              Enroll
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="text-blue-600 font-medium mb-1">Event</div>
            <h4 className="font-medium mb-2">Coding Competition</h4>
            <p className="text-sm text-gray-600 mb-3">Join our monthly coding challenge and win prizes</p>
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-1.5 rounded transition-colors">
              Register
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
