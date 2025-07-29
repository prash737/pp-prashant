"use client"

import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-10">
                <Image
                  src="/images/pathpiper-logo-footer.png"
                  width={240}
                  height={60}
                  alt="PathPiper Logo"
                  className="h-full w-auto"
                />
              </div>
            </div>
            <p className="text-slate-400">A global, safe, education-focused social networking platform for students.</p>
            <div className="mt-4">
              <div className="w-10 h-10">
                <Image src="/images/pip-mascot.png" width={40} height={40} alt="Pip" className="w-full h-full" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="/student-profiles" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Student Profiles
                </a>
              </li>
              <li>
                <a href="/mentorship" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Mentorship
                </a>
              </li>
              <li>
                <a href="/institutions" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Institutions
                </a>
              </li>
              <li>
                <a href="/explore" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Career Discovery
                </a>
              </li>
              <li>
                <a href="/self-analysis" className="text-slate-400 hover:text-teal-400 transition-colors font-medium">
                  🧠 Self Analysis
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-slate-400 hover:text-teal-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="/blog" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/contact" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/safety" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Safety Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} PathPiper. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
