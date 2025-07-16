import Image from "next/image"

export function TrendingTopics() {
  const topics = [
    { id: 1, name: "Mathematics", image: "/images/math-topic.png", posts: "1.2k posts" },
    { id: 2, name: "Science", image: "/images/science-topic.png", posts: "856 posts" },
    { id: 3, name: "Coding", image: "/images/coding-topic.png", posts: "1.5k posts" },
    { id: 4, name: "Arts", image: "/images/arts-topic.png", posts: "723 posts" },
    { id: 5, name: "History", image: "/images/history-topic.png", posts: "512 posts" },
    { id: 6, name: "Languages", image: "/images/language-topic.png", posts: "934 posts" },
    { id: 7, name: "Music", image: "/images/music-topic.png", posts: "645 posts" },
    { id: 8, name: "Sports", image: "/images/sports-topic.png", posts: "789 posts" },
  ]

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Trending Topics</h2>
        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">View all</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow text-center"
          >
            <div className="relative h-24 w-full">
              <Image src={topic.image || "/placeholder.svg"} alt={topic.name} className="object-cover" fill />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-sm">{topic.name}</h3>
              <p className="text-gray-500 text-xs">{topic.posts}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
