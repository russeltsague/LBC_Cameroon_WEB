'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiSave, FiX, FiTrash2, FiEdit } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  hasPoules: boolean;
  poules: string[];
}

interface SchedulePreview {
  matches: any[];
  totalMatches: number;
  journees: number;
  startDate: string;
  endDate: string;
  category: string;
  poule?: string;
}

export function ScheduleGenerator() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPoule, setSelectedPoule] = useState('');
  const [startDate, setStartDate] = useState('');
  const [daysBetweenMatches, setDaysBetweenMatches] = useState(7);
  const [timeSlots, setTimeSlots] = useState(['14:00', '16:00', '18:00']);
  const [preview, setPreview] = useState<SchedulePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleGenerateSchedule = async () => {
    if (!selectedCategory || !startDate || timeSlots.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedCat = categories.find(c => c.name === selectedCategory);
    if (selectedCat?.hasPoules && !selectedPoule) {
      toast.error('Please select a poule for this category');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules/generate`, {
        category: selectedCategory,
        poule: selectedPoule || undefined,
        startDate,
        daysBetweenMatches,
        timeSlots
      });

      if (response.data.success) {
        setPreview(response.data.data);
        toast.success(`Generated ${response.data.data.totalMatches} matches`);
      }
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      toast.error(error.response?.data?.error || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules/save`, {
        preview
      });

      if (response.data.success) {
        toast.success('Schedule saved successfully!');
        setPreview(null);
        // Reset form
        setSelectedCategory('');
        setSelectedPoule('');
        setStartDate('');
      }
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(error.response?.data?.error || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
  };

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Form */}
      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white font-oswald mb-6">Generate Match Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div>
              <label className="block text-gray-300 font-outfit mb-2">Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedPoule('');
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Poule Selection */}
            {selectedCategoryData?.hasPoules && (
              <div>
                <label className="block text-gray-300 font-outfit mb-2">Poule *</label>
                <select
                  value={selectedPoule}
                  onChange={(e) => setSelectedPoule(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Poule</option>
                  {selectedCategoryData.poules.map((poule) => (
                    <option key={poule} value={poule}>Poule {poule}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Date */}
            <div>
              <label className="block text-gray-300 font-outfit mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Days Between Matches */}
            <div>
              <label className="block text-gray-300 font-outfit mb-2">Days Between Matches</label>
              <input
                type="number"
                value={daysBetweenMatches}
                onChange={(e) => setDaysBetweenMatches(parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Time Slots */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 font-outfit mb-2">Time Slots *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <FiClock className="text-gray-400" />
                    <span className="text-white">{slot}</span>
                    <button
                      onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="time"
                  id="newTimeSlot"
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('newTimeSlot') as HTMLInputElement;
                    if (input.value && !timeSlots.includes(input.value)) {
                      setTimeSlots([...timeSlots, input.value]);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Time Slot
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateSchedule}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <FiCalendar />
              {generating ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white font-oswald">Schedule Preview</h2>
              <p className="text-gray-400 font-outfit mt-1">
                {preview.totalMatches} matches • {preview.journees} journées • {preview.category}
                {preview.poule && ` - Poule ${preview.poule}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelPreview}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <FiX />
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Journée</th>
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Date</th>
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Time</th>
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Home Team</th>
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Away Team</th>
                  <th className="text-left text-gray-400 font-outfit py-3 px-4">Venue</th>
                </tr>
              </thead>
              <tbody>
                {preview.matches.map((match, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="text-white font-outfit py-3 px-4">{match.journee}</td>
                    <td className="text-white font-outfit py-3 px-4">
                      {new Date(match.date).toLocaleDateString()}
                    </td>
                    <td className="text-white font-outfit py-3 px-4">{match.time}</td>
                    <td className="text-white font-outfit py-3 px-4">{match.homeTeam?.name || 'TBD'}</td>
                    <td className="text-white font-outfit py-3 px-4">{match.awayTeam?.name || 'TBD'}</td>
                    <td className="text-gray-400 font-outfit py-3 px-4 text-sm">{match.venue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
