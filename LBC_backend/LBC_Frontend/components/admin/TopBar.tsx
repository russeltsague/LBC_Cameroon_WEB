'use client'

import { FiSearch, FiBell, FiUser } from 'react-icons/fi'

export const TopBar = () => {
    return (
        <div className="h-20 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-outfit"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 ml-4">
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-gray-900"></span>
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white font-oswald tracking-wide">Admin User</p>
                        <p className="text-xs text-gray-500 font-outfit">Super Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <FiUser className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    )
}
