import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/shop/AuthProvider'
import { Navbar } from '@/components/shop/Navbar'
import { CartDrawer } from '@/components/shop/CartDrawer'

export const metadata: Metadata = {
  title: 'MyCheapMarketPlace',
  description: 'Günstige Produkte aller Art — dein Online-Marktplatz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <footer className="bg-gray-900 text-gray-400 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold mb-3">MyCheapMarketPlace</h3>
                <p className="text-sm">Günstige Produkte aller Art — direkt zu dir nach Hause.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Shop</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="/products" className="hover:text-white transition-colors">Alle Produkte</a></li>
                  <li><a href="/auth/login" className="hover:text-white transition-colors">Anmelden</a></li>
                  <li><a href="/auth/register" className="hover:text-white transition-colors">Registrieren</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Konto</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="/account/orders" className="hover:text-white transition-colors">Meine Bestellungen</a></li>
                  <li><a href="/account" className="hover:text-white transition-colors">Profil</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 py-4 text-center text-xs">
              © {new Date().getFullYear()} MyCheapMarketPlace
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
