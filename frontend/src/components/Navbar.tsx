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
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-mark-192.png"
              alt="CocheraVecina"
              className="h-8 w-8 object-contain transition-transform duration-150 group-hover:scale-105"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Cochera<span className="text-blue-600">Vecina</span>
              </span>
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200/60">
                MX
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/search"
              className="text-slate-600 hover:text-blue-600 transition-colors duration-150"
            >
              Buscar cochera
            </Link>
            <Link
              href="/dashboard?tab=host"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/60 px-3.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100/80 hover:border-blue-300 transition-colors duration-150"
            >
              <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
              Publicar mi espacio
            </Link>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150"
                >
                  {user.avatar_url ? (
                    <img
                      src={getMediaUrl(user.avatar_url)}
                      alt={user.full_name}
                      className="h-5 w-5 rounded-full object-cover ring-1 ring-blue-600/30"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserIcon className="h-3 w-3" />
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{user.full_name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors duration-150"
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
