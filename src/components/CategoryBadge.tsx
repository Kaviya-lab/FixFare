import { Category, getCategoryColor } from "@/types/database";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        getCategoryColor(category),
        className
      )}
    >
      {category}
    </span>
  );
}
