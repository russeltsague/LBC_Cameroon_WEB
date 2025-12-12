'use client';

import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import { ScheduleGenerator } from '@/components/admin/ScheduleGenerator';

export default function SchedulesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 font-oswald tracking-wide uppercase">
            Schedule Generator
          </h1>
          <div className="flex items-center space-x-2 text-gray-400 font-outfit">
            <FiCalendar className="w-4 h-4" />
            <span>Automatically generate match schedules with round-robin algorithm</span>
          </div>
        </div>
      </motion.div>

      {/* Schedule Generator Component */}
      <ScheduleGenerator />
    </div>
  );
}
