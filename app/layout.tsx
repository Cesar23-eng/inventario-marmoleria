import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Package, Wrench, Menu } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marmolería Inventario',
  description: 'Sistema de Gestión de Inventario para Marmolería',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-50 min-h-screen flex flex-col md:flex-row`}>
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-zinc-900 text-zinc-300 md:min-h-screen flex flex-col shadow-xl">
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-xl font-bold text-white tracking-tight">Marmolería</h1>
            <p className="text-sm text-zinc-500">Gestión de Inventario</p>
          </div>
          
          <nav className="flex flex-col gap-2 p-4">
            <Link href="/inventario/placas" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors group">
              <Package size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="font-semibold text-zinc-300 group-hover:text-white">Catálogo de Placas</span>
            </Link>

            <Link href="/inventario/herramientas" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors group">
              <Wrench size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="font-semibold text-zinc-300 group-hover:text-white">Herramientas</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <p className="text-white font-medium">Admin</p>
                <p className="text-xs text-zinc-500">Marmolería Claros</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
