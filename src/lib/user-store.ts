import { supabase } from "@/integrations/supabase/client";

const USER_KEY = "fixfare_user";

interface StoredUser {
  id: string;
  username: string;
}

export const userStore = {
  getUser: (): StoredUser | null => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  setUser: (user: StoredUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn: (): boolean => {
    return userStore.getUser() !== null;
  },
};

export async function getOrCreateUser(username: string): Promise<StoredUser> {
  // First try to find existing user
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    const user = { id: existingUser.id, username: existingUser.username };
    userStore.setUser(user);
    return user;
  }

  // Create new user if not found
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({ username })
    .select("id, username")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  const user = { id: newUser.id, username: newUser.username };
  userStore.setUser(user);
  return user;
}
