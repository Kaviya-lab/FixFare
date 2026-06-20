import { Solution } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ExternalLink, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SolutionCardProps {
  solution: Solution;
  onUpvote: () => void;
  isUpvoting?: boolean;
  currentUserId?: string;
}

export function SolutionCard({ 
  solution, 
  onUpvote, 
  isUpvoting,
  currentUserId 
}: SolutionCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 glass border-border/50",
        solution.is_ai_generated && "neon-border-blue"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{solution.user?.username || "Anonymous"}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(solution.created_at), { addSuffix: true })}</span>
          </div>
          {solution.is_ai_generated && (
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Generated
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-foreground leading-relaxed">
          {solution.content}
        </p>

        {/* Product Link */}
        {solution.product_link && (
          <a
            href={solution.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-sm font-medium glow-pink"
          >
            <ExternalLink className="h-4 w-4" />
            {solution.product_name || "View Product"}
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpvote}
            disabled={isUpvoting}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              solution.has_upvoted && "text-primary"
            )}
          >
            <ThumbsUp className={cn("mr-1 h-4 w-4", solution.has_upvoted && "fill-current")} />
            {solution.upvotes_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
