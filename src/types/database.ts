export type Category = 
  | "Home" 
  | "Fashion" 
  | "Tech" 
  | "Study" 
  | "Budget" 
  | "Organization" 
  | "DIY";

export interface User {
  id?: string;
  username: string;
  created_at?: string;
}

export interface Problem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  solutions_count?: number;
}

export interface Solution {
  id: string;
  problem_id: string;
  user_id: string;
  content: string;
  product_link: string | null;
  product_name: string | null;
  is_ai_generated: boolean;
  upvotes_count: number;
  created_at: string;
  user?: User;
  has_upvoted?: boolean;
}

export interface Upvote {
  id: string;
  solution_id: string;
  user_id: string;
  created_at: string;
}

export const CATEGORIES: Category[] = [
  "Home",
  "Fashion", 
  "Tech",
  "Study",
  "Budget",
  "Organization",
  "DIY",
];

export const getCategoryColor = (category: Category): string => {
  const colors: Record<Category, string> = {
    Tech: "bg-category-tech/20 text-category-tech border-category-tech/30",
    Fashion: "bg-category-fashion/20 text-category-fashion border-category-fashion/30",
    Home: "bg-category-home/20 text-category-home border-category-home/30",
    Study: "bg-category-study/20 text-category-study border-category-study/30",
    Budget: "bg-category-budget/20 text-category-budget border-category-budget/30",
    Organization: "bg-category-organization/20 text-category-organization border-category-organization/30",
    DIY: "bg-category-diy/20 text-category-diy border-category-diy/30",
  };
  return colors[category];
};
