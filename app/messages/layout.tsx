
import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - PathPiper",
  description: "Connect and communicate with your network on PathPiper",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
