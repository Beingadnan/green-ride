import Link from "next/link";
import { Bus, Mail, Phone, MapPin, Leaf, Twitter, Facebook, Instagram, Linkedin, Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-primary-600">
      <div className="saas-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4"><div className="bg-gradient-to-br from-primary-600 to-emerald-600 p-2 rounded-xl shadow-lg"><Bus className="h-5 w-5 text-white" /></div><span className="text-xl font-bold text-white">GreenRide<span className="text-primary-400">Express</span></span></div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6"><strong className="text-white">Jharkhand's First 100% Electric Intercity Bus.</strong><br/>Book your eco-friendly trip today and experience clean, comfortable, and affordable travel.</p>
            <div className="flex items-center gap-2 text-primary-400 bg-primary-950 px-3 py-2 rounded-lg border border-primary-800"><Leaf className="h-4 w-4" /><span className="text-sm font-semibold">100% Electric • 0% Emissions</span></div>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Home</Link></li>
              <li><Link href="/search" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Search Buses</Link></li>
              <li><Link href="/user/bookings" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>My Bookings</Link></li>
              <li><Link href="/auth/login" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Login / Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Support & Policies</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Terms of Service</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-primary-400 transition-colors"></span>Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400"><MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-400" /><span>Jhumri Telaiya, Jharkhand 825409, India</span></li>
              <li className="flex items-center gap-3"><Phone className="h-5 w-5 flex-shrink-0 text-primary-400" /><a href="tel:+919142108321" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">+91 91421 08321</a></li>
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 flex-shrink-0 text-primary-400" /><a href="mailto:info@greenride-express.com" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">info@greenride-express.com</a></li>
            </ul>
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Follow Us</p>
              <div className="flex items-center gap-3">
                <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-primary-600 transition-all hover:scale-110" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-primary-600 transition-all hover:scale-110" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-primary-600 transition-all hover:scale-110" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-primary-600 transition-all hover:scale-110" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© {currentYear} GreenRide Express. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-primary-400" /><span className="text-slate-400">100% Electric</span></div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-2 text-sm"><Leaf className="h-4 w-4 text-emerald-400" /><span className="text-slate-400">0% Emissions</span></div>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">Made with 💚 in Jharkhand</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


