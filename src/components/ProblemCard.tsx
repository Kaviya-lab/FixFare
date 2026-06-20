import { Problem } from "@/types/database";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
  isNew?: boolean;
}

export function ProblemCard({ problem, onClick, isNew }: ProblemCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-[1.02] glass border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
        isNew && "animate-new-problem"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={problem.category} />
              {problem.is_solved ? (
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 hover:bg-neon-green/30">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Solved
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Unsolved
                </Badge>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 leading-tight">
              {problem.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {problem.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {problem.user?.username || "Anonymous"}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {problem.solutions_count || 0} solutions
            </span>
          </div>
          <span>
            {formatDistanceToNow(new Date(problem.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
