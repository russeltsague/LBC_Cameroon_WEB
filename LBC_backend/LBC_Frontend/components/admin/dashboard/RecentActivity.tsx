'use client'

import { motion } from 'framer-motion'
import { FiTrendingUp, FiCheck, FiPlus } from 'react-icons/fi'

export const RecentActivity = () => {
    // Placeholder data - in a real app, this would come from an API
    const activities = [
        {
            id: 1,
            type: 'result',
            message: 'Score mis à jour : FAP vs BEAC',
            time: 'Il y a 2h',
            icon: FiCheck,
            color: 'bg-green-500'
        },
        {
            id: 2,
            type: 'team',
            message: 'Nouvelle équipe inscrite : Vogt',
            time: 'Il y a 5h',
            icon: FiPlus,
            color: 'bg-blue-500'
        },
        {
            id: 3,
            type: 'match',
            message: 'Match programmé : Onyx vs Alph',
            time: 'Il y a 1j',
            icon: FiCalendar,
            color: 'bg-orange-500'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/10"
        >
            <h3 className="text-lg font-bold text-white mb-6 font-oswald tracking-wide flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Activité Récente
            </h3>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full ${activity.color}/20 flex items-center justify-center`}>
                                <activity.icon className={`w-4 h-4 ${activity.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                                <p className="text-white font-medium font-outfit">{activity.message}</p>
                                <p className="text-xs text-gray-500 font-outfit">{activity.time}</p>
                            </div>
                        </div>
                        <button className="text-xs text-gray-400 hover:text-white font-outfit">Détails</button>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

import { FiCalendar } from 'react-icons/fi'
