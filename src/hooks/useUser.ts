import { useState, useEffect } from "react";
import { userStore } from "@/lib/user-store";

interface User {
  id: string;
  username: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = userStore.getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const updateUser = (newUser: User | null) => {
    if (newUser) {
      userStore.setUser(newUser);
    } else {
      userStore.clearUser();
    }
    setUser(newUser);
  };

  const logout = () => {
    userStore.clearUser();
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    setUser: updateUser,
    logout,
  };
}
