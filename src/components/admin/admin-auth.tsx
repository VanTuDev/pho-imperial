"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, me, type AdminUser } from "@/lib/admin-api";

interface AdminAuthValue {
  admin: AdminUser | null;
  loading: boolean;
  setAdmin: (a: AdminUser) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdminState] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback((): Promise<void> => {
    if (!getToken()) {
      setAdminState(null);
      setLoading(false);
      return Promise.resolve();
    }
    return me().then(
      (admin) => {
        setAdminState(admin);
        setLoading(false);
      },
      () => {
        clearToken();
        setAdminState(null);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    let alive = true;
    if (!getToken()) {
      // No session — nothing to fetch; drop the loading gate.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    me().then(
      (admin) => alive && (setAdminState(admin), setLoading(false)),
      () => {
        if (!alive) return;
        clearToken();
        setAdminState(null);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setAdminState(null);
    router.replace("/admin/login");
  }, [router]);

  return (
    <AdminAuthContext
      value={{ admin, loading, setAdmin: setAdminState, refresh, logout }}
    >
      {children}
    </AdminAuthContext>
  );
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  return ctx;
}
