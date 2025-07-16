
"use client"

import { toast } from "sonner"
import { CheckCircle, AlertCircle, XCircle, Users, Heart, Sparkles } from "lucide-react"

interface CustomToastOptions {
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function useCustomToast() {
  const customToast = ({ title, description, type = 'info', duration = 4000 }: CustomToastOptions) => {
    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-500" />
        case 'error':
          return <XCircle className="h-5 w-5 text-red-500" />
        case 'warning':
          return <AlertCircle className="h-5 w-5 text-orange-500" />
        default:
          return <Sparkles className="h-5 w-5 text-pathpiper-teal" />
      }
    }

    const getBackgroundColor = () => {
      switch (type) {
        case 'success':
          return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        case 'error':
          return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
        case 'warning':
          return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
        default:
          return 'bg-gradient-to-r from-pathpiper-teal/5 to-blue-50 border-pathpiper-teal/20'
      }
    }

    toast.custom((t) => (
      <div className={`
        ${getBackgroundColor()}
        p-4 rounded-xl border-2 shadow-lg max-w-md w-full
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-105
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {title}
            </p>
            {description && (
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    ), {
      duration,
      position: 'top-right'
    })
  }

  const connectionToast = {
    alreadyConnected: (name: string) => customToast({
      title: "Already Connected! 🎉",
      description: `You're already connected with ${name}. Check your connections to chat!`,
      type: 'info'
    }),
    
    requestSent: (name: string) => customToast({
      title: "Connection Request Sent! 📤",
      description: `Your request has been sent to ${name}. They'll be notified soon!`,
      type: 'success'
    }),
    
    requestPending: (name: string) => customToast({
      title: "Request Pending ⏳",
      description: `You already have a pending request with ${name}. Please wait for their response.`,
      type: 'warning'
    }),
    
    connectionError: () => customToast({
      title: "Connection Failed ❌",
      description: "Something went wrong. Please try again later.",
      type: 'error'
    })
  }

  return { customToast, connectionToast }
}
