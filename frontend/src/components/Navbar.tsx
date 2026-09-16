"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, api, getMediaUrl } from "@/lib/api";
import AuthModal from "@/components/AuthModal";
import { ShieldCheck, Car, User as UserIcon, PlusCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("cochera_token");
    if (savedToken) {
      setToken(savedToken);
      api.auth
        .me(savedToken)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("cochera_token");
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cochera_token");
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Car className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Cochera<span className="text-blue-600">Vecina</span>
                </span>
                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                  MX
                </span>
              </div>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/search" className="transition hover:text-blue-600">
              Buscar cochera
            </Link>
            <Link href="/dashboard?tab=host" className="transition hover:text-blue-600 flex items-center gap-1">
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Publicar mi espacio
            </Link>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {user.avatar_url ? (
                    <img
                      src={getMediaUrl(user.avatar_url)}
                      alt="Avatar"
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  <span>{user.full_name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser, newToken) => {
          setUser(newUser);
          setToken(newToken);
        }}
      />
    </>
  );
}
