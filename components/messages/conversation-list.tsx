
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isGroup?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  return (
    <ScrollArea className="h-[500px]">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedId === conversation.id ? 'bg-teal-50 border-r-4 border-r-teal-500' : ''
          }`}
          onClick={() => onSelect(conversation.id)}
        >
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>
                  {conversation.isGroup ? <Users className="h-4 w-4" /> : conversation.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && !conversation.isGroup && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                <span className="text-xs text-gray-500">{conversation.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
            </div>
            {conversation.unread > 0 && (
              <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                {conversation.unread}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}
