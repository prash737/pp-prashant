"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface ModerationHelperProps {
  content: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
}

interface SafePhrase {
  original: string;
  safe: string;
  category: string;
}

export default function ModerationHelper({
  content,
  onSuggestionSelect,
  onClose,
}: ModerationHelperProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSafeSuggestions();
  }, []);

  const fetchSafeSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/moderation?scenario=general");
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setVocabulary(data.vocabulary || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSafeAlternatives = (text: string): SafePhrase[] => {
    const alternatives: SafePhrase[] = [];
    const lowercaseText = text.toLowerCase();

    // Common problematic phrases and their safe alternatives for feed posts
    const replacements = [
      {
        pattern: /\b(stupid|dumb|idiotic)\b/gi,
        safe: "challenging",
        category: "respectful",
      },
      { pattern: /\b(hate|despise)\b/gi, safe: "dislike", category: "emotion" },
      {
        pattern: /\b(ugly|hideous)\b/gi,
        safe: "not my style",
        category: "appearance",
      },
      {
        pattern: /\b(shut up|be quiet)\b/gi,
        safe: "please listen",
        category: "communication",
      },
      {
        pattern: /\b(loser|failure)\b/gi,
        safe: "someone who is learning",
        category: "encouragement",
      },
      {
        pattern: /\b(angry|furious|mad)\b/gi,
        safe: "frustrated",
        category: "emotion",
      },
      {
        pattern: /\b(this sucks|this is terrible)\b/gi,
        safe: "this is challenging",
        category: "feedback",
      },
      // Feed-specific improvements
      {
        pattern: /\b(kill myself|want to die)\b/gi,
        safe: "feeling overwhelmed",
        category: "mental health",
      },
      {
        pattern: /\b(everyone hates me|nobody likes me)\b/gi,
        safe: "feeling isolated",
        category: "social support",
      },
      {
        pattern: /\b(you\'re so dumb|you\'re stupid)\b/gi,
        safe: "that's confusing",
        category: "constructive feedback",
      },
      {
        pattern: /\b(this is impossible|can\'t do this)\b/gi,
        safe: "this is really challenging",
        category: "growth mindset",
      },
    ];

    replacements.forEach(({ pattern, safe, category }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          alternatives.push({
            original: match,
            safe: safe,
            category: category,
          });
        });
      }
    });

    return alternatives;
  };

  const safeAlternatives = getSafeAlternatives(content);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    onClose();
  };

  const isContentSafe = (text: string): boolean => {
    const unsafePatterns = [
      /\b(stupid|dumb|hate|ugly|shut up|loser|kill|die|hurt)\b/gi,
      /\b(address|phone|email|meet me|come over)\b/gi,
    ];

    return !unsafePatterns.some((pattern) => pattern.test(text));
  };

  const contentSafety = isContentSafe(content);

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Shield className="h-5 w-5" />
          Content Safety Helper
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Content Safety Status */}
        <div
          className={`p-4 rounded-lg border ${
            contentSafety
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {contentSafety ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span
              className={`font-medium ${
                contentSafety ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {contentSafety
                ? "Content looks safe!"
                : "Content may need improvement"}
            </span>
          </div>
          <p
            className={`text-sm ${
              contentSafety ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {contentSafety
              ? "Your content follows our child-friendly guidelines."
              : "Consider using kinder, more appropriate language for our community."}
          </p>
        </div>

        {/* Safe Alternatives */}
        {safeAlternatives.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Suggested Improvements
            </h3>
            <div className="space-y-2">
              {safeAlternatives.map((alt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="text-red-600 line-through">
                        "{alt.original}"
                      </span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 font-medium">
                        "{alt.safe}"
                      </span>
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {alt.category}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newContent = content.replace(
                        new RegExp(alt.original, "gi"),
                        alt.safe,
                      );
                      handleSuggestionClick(newContent);
                    }}
                    className="ml-2"
                  >
                    Use This
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-written Safe Phrases */}
        {suggestions.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">
              Safe Phrase Suggestions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left justify-start p-3 h-auto"
                >
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Child-Safe Vocabulary */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Recommended Words</h3>
          <div className="flex flex-wrap gap-2">
            {vocabulary.slice(0, 20).map((word, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => handleSuggestionClick(word)}
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            I'll Revise My Content
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
