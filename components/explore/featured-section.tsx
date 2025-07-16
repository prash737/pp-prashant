import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

export function FeaturedSection() {
  return (
    <section className="mb-10 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Featured</h2>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
            <ChevronLeft size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative rounded-lg overflow-hidden h-64 group">
          <Image
            src="/images/robotics-workshop.png"
            alt="Robotics Workshop"
            className="object-cover transition-transform group-hover:scale-105 duration-300"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="text-white/80 text-sm mb-1">Featured Event</div>
            <h3 className="text-white text-xl font-semibold mb-2">Summer Robotics Workshop</h3>
            <p className="text-white/90 text-sm mb-3">
              Learn to build and program your own robot in this hands-on workshop
            </p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm transition-colors">
              Learn more
            </button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden h-64 group">
          <Image
            src="/images/science-fair.png"
            alt="Science Fair"
            className="object-cover transition-transform group-hover:scale-105 duration-300"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="text-white/80 text-sm mb-1">Featured Resource</div>
            <h3 className="text-white text-xl font-semibold mb-2">Science Fair Project Guide</h3>
            <p className="text-white/90 text-sm mb-3">
              Everything you need to create an award-winning science fair project
            </p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm transition-colors">
              Download guide
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
