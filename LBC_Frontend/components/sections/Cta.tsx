
// components/CtaSection.tsx
'use client'
import { motion } from 'framer-motion'
import { FiMail, FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi'

export const CtaSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-orange-900">
      <div className="container px-6 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Restez Informé Sur La Ligue
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-200 mb-10"
          >
            Abonnez-vous à notre newsletter et suivez-nous sur les réseaux sociaux pour les dernières nouvelles
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-12"
          >
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              className="flex-grow px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
              S'abonner
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center gap-6"
          >
            <a href="#" className="text-white hover:text-orange-300 transition-colors">
              <FiTwitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-white hover:text-orange-300 transition-colors">
              <FiFacebook className="w-6 h-6" />
            </a>
            <a href="#" className="text-white hover:text-orange-300 transition-colors">
              <FiInstagram className="w-6 h-6" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}