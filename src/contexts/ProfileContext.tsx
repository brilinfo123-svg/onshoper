"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

interface ProfileContextType {
  profile: any;
  products: any[];
  loading: boolean;
  fetchProfile: (contact: string) => Promise<void>;
  refreshProfile: (contact: string) => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(
    async (contact: string) => {
      if (profile) return;

      setLoading(true);

      try {
        const res = await fetch(
          `/api/profile?userEmail=${contact}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();

        setProfile(data);
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [profile]
  );

  const refreshProfile = useCallback(
    async (contact: string) => {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/profile?userEmail=${contact}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();

        setProfile(data);
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        products,
        loading,
        fetchProfile,
        refreshProfile,
        setProducts,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return context;
};