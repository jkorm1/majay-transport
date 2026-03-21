"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Investor {
  name: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  investorName: string | null;
  login: (password: string) => { success: boolean; name?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your investors and their passwords
const INVESTORS: Investor[] = [
  {
    name: "Joseph Korm",
    password: process.env.NEXT_PUBLIC_INVESTOR_1_PASSWORD || "",
  },
  {
    name: "Michael Mallen Quainoo",
    password: process.env.NEXT_PUBLIC_INVESTOR_2_PASSWORD || "",
  },
  {
    name: "Eram Ekor",
    password: process.env.NEXT_PUBLIC_INVESTOR_3_PASSWORD || "",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [investorName, setInvestorName] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("investor-auth");
    if (auth) {
      const { name } = JSON.parse(auth);
      setIsAuthenticated(true);
      setInvestorName(name);
    }
  }, []);

  const login = (password: string) => {
    const investor = INVESTORS.find((inv) => inv.password === password);
    if (investor) {
      setIsAuthenticated(true);
      setInvestorName(investor.name);
      sessionStorage.setItem(
        "investor-auth",
        JSON.stringify({
          authenticated: true,
          name: investor.name,
        }),
      );
      return { success: true, name: investor.name };
    }
    return { success: false };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setInvestorName(null);
    sessionStorage.removeItem("investor-auth");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, investorName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
