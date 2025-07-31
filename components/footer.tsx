"use client"

import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo on the left */}
          <div className="h-12">
            <Image
              src="/images/pathpiper-logo-footer.png"
              width={240}
              height={60}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </div>

          {/* Instagram Icon on the right */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://www.instagram.com/pathpiperofficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427C2.013 15.056 2 14.716 2 12v-.08c0-2.643.013-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.944 2.013 9.284 2 12 2zm0 5.838a4.16 4.16 0 100 8.324 4.16 4.16 0 000-8.324zm0 6.862a2.702 2.702 0 110-5.404 2.702 2.702 0 010 5.404zm5.406-7.002a.972.972 0 11-1.944 0 .972.972 0 011.944 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <p className="text-slate-400 text-xs">
              © {new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}