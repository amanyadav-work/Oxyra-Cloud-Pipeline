"use client";

import Loader from "@/components/ui/Loader";
import useFetch from "@/hooks/useFetch";
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";


type User = any; // Replace 'any' with your user type if available
type UserContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  refetch: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refetch: () => {},
  isLoading: true,
});


interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { refetch } = useFetch({
    auto: true,
    url: `/api/user`,
    withAuth: true,
    onSuccess: (result: any) => {
      setUser(result.user);
      setIsLoading(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "An error occurred while fetching user data");
      setIsLoading(false);
    },
  });

  if (isLoading) return <Loader fullScreen />;

  return (
    <UserContext.Provider value={{ user, setUser, refetch, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);