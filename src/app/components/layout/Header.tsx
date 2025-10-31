"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Bus, User, LogOut, Menu, X, Home, Ticket, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

interface HeaderProps { user?: { phoneE164?: string; phone?: string; name?: string; email?: string; role: string; } | null; }

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, []);
  const handleLogout = async () => { try { await axios.post("/api/auth/logout"); router.push("/"); router.refresh(); } catch (error) { console.error("Logout error:", error); } };
  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? "bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
        : "bg-white/60 backdrop-blur-md border-b border-slate-200/50"
    }`}>
      <div className="saas-container">
        <div className="flex h-20 items-center justify-between md:h-24">
          <Link href="/" className="flex items-center group">
            <Image
              src="/assets/Logo.png"
              alt="GreenRide Express"
              width={240}
              height={240}
              className="w-60 h-60 transition-transform"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-700/90 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all flex items-center gap-2"><Home className="h-4 w-4" />Home</Link>
            {user && (<>
              <Link href="/user/bookings" className="px-4 py-2 text-sm font-medium text-slate-700/90 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all flex items-center gap-2"><Ticket className="h-4 w-4" />My Bookings</Link>
              {user.role === "admin" && (<Link href="/admin/dashboard" className="px-4 py-2 text-sm font-medium text-slate-700/90 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Admin</Link>)}
            </>)}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-slate-200">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-200">
                  <div className="bg-gradient-to-br from-primary-600 to-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                  <span className="text-sm font-semibold text-slate-900 max-w-[120px] truncate">{user.name || user.phoneE164 || user.phone}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"><LogOut className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="ml-4 pl-4 border-l-2 border-slate-200">
                <Link href="/auth/login"><Button size="sm" className="px-6"><User className="h-4 w-4 mr-2" />Login / Sign Up</Button></Link>
              </div>
            )}
          </nav>
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? (<X className="h-6 w-6 text-slate-700" />) : (<Menu className="h-6 w-6 text-slate-700" />)}</button>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100/80 text-slate-700 transition-colors"><Home className="h-5 w-5 text-primary-600" /><span className="text-sm font-medium">Home</span></Link>
              {user ? (<>
                <Link href="/user/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100/80 text-slate-700 transition-colors"><Ticket className="h-5 w-5 text-primary-600" /><span className="text-sm font-medium">My Bookings</span></Link>
                {user.role === "admin" && (<Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100/80 text-slate-700 transition-colors"><LayoutDashboard className="h-5 w-5 text-primary-600" /><span className="text-sm font-medium">Admin Dashboard</span></Link>)}
                <div className="px-4 py-4 mt-2 border-t border-slate-200">
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                    <div className="bg-gradient-to-br from-primary-600 to-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{user.name || "User"}</p><p className="text-xs text-slate-600 truncate">{user.phone}</p></div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full text-red-600 border-red-200 hover:bg-red-50 font-medium"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
                </div>
              </>) : (
                <div className="px-4 pt-2"><Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}><Button size="lg" className="w-full"><User className="h-4 w-4 mr-2" />Login / Sign Up</Button></Link></div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}


