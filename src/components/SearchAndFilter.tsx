import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, Category } from "@/types/database";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  sortBy: "newest" | "most_solved";
  onSortChange: (sort: "newest" | "most_solved") => void;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: SearchAndFilterProps) {
  const hasFilters = searchQuery || selectedCategory !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted/30 border-border focus:border-primary"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange as any}>
          <SelectTrigger className="w-[140px] bg-muted/30 border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange as any}>
          <SelectTrigger className="w-[130px] bg-muted/30 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most_solved">Most Solved</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
