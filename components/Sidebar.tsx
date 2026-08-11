'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Wrench, Menu, X } from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden p-4 bg-zinc-900 flex justify-between items-center text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">Marmolería</h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-zinc-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Marmolería</h1>
            <p className="text-sm text-zinc-500">Gestión de Inventario</p>
          </div>
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <Link 
            href="/inventario/placas" 
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
              pathname?.includes('/placas') 
                ? 'bg-zinc-800 text-white' 
                : 'hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <Package size={20} className={pathname?.includes('/placas') ? 'text-white' : 'text-zinc-400 group-hover:text-white'} />
            <span className="font-semibold">Catálogo de Placas</span>
          </Link>

          <Link 
            href="/inventario/herramientas" 
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
              pathname?.includes('/herramientas') 
                ? 'bg-zinc-800 text-white' 
                : 'hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <Wrench size={20} className={pathname?.includes('/herramientas') ? 'text-white' : 'text-zinc-400 group-hover:text-white'} />
            <span className="font-semibold">Herramientas</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-zinc-800 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">Admin</p>
              <p className="text-xs text-zinc-500 truncate">Marmolería Claros</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
