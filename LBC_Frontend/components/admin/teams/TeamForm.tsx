'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSave, FiUpload, FiPlus, FiTrash2, FiUser, FiBriefcase, FiMail, FiGlobe } from 'react-icons/fi'
import { Team, Category, TeamMember } from '@/app/lib/api'

interface TeamFormProps {
    team?: Team | null
    categories: Category[]
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const TeamForm = ({ team, categories, onSave, onCancel }: TeamFormProps) => {
    const [formData, setFormData] = useState<Partial<Team>>({
        name: '',
        city: '',
        logo: '',
        category: '',
        coach: '',
        founded: new Date().getFullYear(),
        championships: 0,
        arena: '',
        about: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: ''
        },
        players: [],
        staff: [],
        poule: '',
        isActive: true,
        ...team
    })
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'social' | 'roster'>('basic')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name.startsWith('socialMedia.')) {
            const socialField = name.split('.')[1]
            setFormData(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    [socialField]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'founded' || name === 'championships' ? parseInt(value) || 0 : value
            }))
        }
    }

    const handleAddMember = (type: 'player' | 'staff') => {
        const newMember: TeamMember = {
            name: '',
            number: undefined,
            position: '',
            role: '',
            birthDate: '',
            height: undefined,
            weight: undefined,
            nationality: '',
            image: '',
            type
        }
        const propertyName = type === 'player' ? 'players' : 'staff'
        setFormData(prev => ({
            ...prev,
            [propertyName]: [...(prev[propertyName] as TeamMember[]), newMember]
        }))
    }

    const handleRemoveMember = (type: 'player' | 'staff', index: number) => {
        const propertyName = type === 'player' ? 'players' : 'staff'
        setFormData(prev => ({
            ...prev,
            [propertyName]: (prev[propertyName] as TeamMember[]).filter((_, i) => i !== index)
        }))
    }

    const handleMemberChange = (type: 'player' | 'staff', index: number, field: keyof TeamMember, value: any) => {
        const propertyName = type === 'player' ? 'players' : 'staff'
        setFormData(prev => ({
            ...prev,
            [propertyName]: (prev[propertyName] as TeamMember[]).map((member, i) => 
                i === index ? { ...member, [field]: value } : member
            )
        }))
    }

    const validateForm = () => {
        // Require team name
        if (!formData.name || formData.name.trim() === '') {
            alert('Veuillez entrer un nom pour l\'équipe');
            return false;
        }
        
        // Require category
        if (!formData.category || formData.category.trim() === '') {
            alert('Veuillez sélectionner une catégorie');
            return false;
        }
        
        // Require poule only if category has poules
        if (hasPoules && (!formData.poule || formData.poule.trim() === '')) {
            alert('Veuillez sélectionner une poule');
            return false;
        }
        
        
        return true;
};
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true)
        try {
            // Only send essential fields for team creation
            const teamData: any = {
                name: formData.name,
                category: formData.category,
                isActive: true,
                // Provide required defaults for backend validation
                about: formData.about || 'Aucune description fournie',
                coach: formData.coach || 'Non spécifié',
                arena: formData.arena || 'Non spécifié',
                founded: formData.founded || new Date().getFullYear(),
                city: 'Non spécifié'
            };
            
            // Only include poule if the category has poules
            if (hasPoules && formData.poule) {
                teamData.poule = formData.poule;
            }
            
            // Only include optional fields if they have meaningful values
            if (formData.coach && formData.coach.trim() !== '') {
                teamData.coach = formData.coach;
            }
            
            if (formData.arena && formData.arena.trim() !== '') {
                teamData.arena = formData.arena;
            }
            
            if (formData.about && formData.about.trim() !== '') {
                teamData.about = formData.about;
            }
            
            if (formData.founded && formData.founded !== new Date().getFullYear()) {
                teamData.founded = formData.founded;
            }
            
            if (formData.championships && formData.championships > 0) {
                teamData.championships = formData.championships;
            }
            
            // Only include social media if any field has a value
            const hasSocialMedia = (formData.socialMedia?.facebook || 
                                 formData.socialMedia?.twitter || 
                                 formData.socialMedia?.instagram);
            if (hasSocialMedia) {
                teamData.socialMedia = {
                    facebook: formData.socialMedia?.facebook || '',
                    twitter: formData.socialMedia?.twitter || '',
                    instagram: formData.socialMedia?.instagram || ''
                };
            }
            
            // Only include players/staff if they exist
            if (formData.players && formData.players.length > 0) {
                teamData.players = formData.players;
            }
            
            if (formData.staff && formData.staff.length > 0) {
                teamData.staff = formData.staff;
            }
            
            await onSave(teamData)
        } catch (error: any) {
            console.error('Error saving team:', error);
            
            // Check for duplicate key error
            if (error.message && error.message.includes('E11000 duplicate key error')) {
                const errorMessage = error.message;
                // Extract the duplicate key values from the error message
                const match = errorMessage.match(/\{ name: "([^"]+)", category: "([^"]+)", poule: "([^"]+)" \}/);
                if (match) {
                    const [, name, category, poule] = match;
                    alert(`Une équipe avec le nom "${name}" existe déjà dans la catégorie "${category}" et la poule "${poule}". Veuillez utiliser un nom différent ou modifier la catégorie/poule.`);
                } else {
                    alert('Une équipe avec ces informations existe déjà. Veuillez vérifier les données saisies.');
                }
            } else {
                alert('Une erreur est survenue lors de la sauvegarde de l\'équipe');
            }
        } finally {
            setLoading(false)
        }
    }

    const selectedCategory = categories.find(cat => cat.name === formData.category)
    const hasPoules = selectedCategory?.hasPoules

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="glass rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white font-oswald tracking-wide">
                        {team ? 'Modifier l\'équipe' : 'Nouvelle Équipe'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {[
                        { id: 'basic', label: 'Informations', icon: FiUser },
                        { id: 'contact', label: 'Contact', icon: FiMail },
                        { id: 'social', label: 'Réseaux', icon: FiGlobe },
                        { id: 'roster', label: 'Effectif', icon: FiBriefcase }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-3 font-outfit text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Tab */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'basic' && (
                                <motion.div
                                    key="basic"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Nom de l'équipe *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Ville *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Catégorie *</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            >
                                                <option value="" className="bg-gray-900">Sélectionner une catégorie</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat.name} className="bg-gray-900">{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {hasPoules && (
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400 font-outfit">Poule *</label>
                                                <select
                                                    name="poule"
                                                    value={formData.poule}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                                >
                                                    <option value="" className="bg-gray-900">Sélectionner une poule</option>
                                                    {selectedCategory?.poules.map(poule => (
                                                        <option key={poule} value={poule} className="bg-gray-900">Poule {poule}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Coach</label>
                                            <input
                                                type="text"
                                                name="coach"
                                                value={formData.coach}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Salle/Arena</label>
                                            <input
                                                type="text"
                                                name="arena"
                                                value={formData.arena}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Année de fondation</label>
                                            <input
                                                type="number"
                                                name="founded"
                                                value={formData.founded}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Nombre de titres</label>
                                            <input
                                                type="number"
                                                name="championships"
                                                value={formData.championships}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-outfit">Logo URL</label>
                                        <input
                                            type="text"
                                            name="logo"
                                            value={formData.logo}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-outfit">Description</label>
                                        <textarea
                                            name="about"
                                            value={formData.about}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit resize-none"
                                            placeholder="Description de l'équipe..."
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive !== false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-orange-500 bg-white/5 border-white/10 rounded focus:ring-orange-500 focus:ring-1"
                                        />
                                        <label className="text-sm text-gray-300 font-outfit cursor-pointer">
                                            Équipe active
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* Contact Tab */}
                            {activeTab === 'contact' && (
                                <motion.div
                                    key="contact"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Email de contact</label>
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={formData.contactEmail}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Téléphone</label>
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm text-gray-400 font-outfit">Site web</label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Social Media Tab */}
                            {activeTab === 'social' && (
                                <motion.div
                                    key="social"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Facebook</label>
                                            <input
                                                type="url"
                                                name="socialMedia.facebook"
                                                value={formData.socialMedia?.facebook || ''}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-outfit">Twitter</label>
                                            <input
                                                type="url"
                                                name="socialMedia.twitter"
                                                value={formData.socialMedia?.twitter || ''}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                                placeholder="https://twitter.com/..."
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm text-gray-400 font-outfit">Instagram</label>
                                            <input
                                                type="url"
                                                name="socialMedia.instagram"
                                                value={formData.socialMedia?.instagram || ''}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Roster Tab */}
                            {activeTab === 'roster' && (
                                <motion.div
                                    key="roster"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Players Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-white font-outfit">Joueurs</h3>
                                            <button
                                                type="button"
                                                onClick={() => handleAddMember('player')}
                                                className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center space-x-2"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                                <span>Ajouter</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {(formData.players as TeamMember[])?.map((player, index) => (
                                                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Nom"
                                                            value={player.name}
                                                            onChange={(e) => handleMemberChange('player', index, 'name', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 transition-colors"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Numéro"
                                                            value={player.number || ''}
                                                            onChange={(e) => handleMemberChange('player', index, 'number', parseInt(e.target.value))}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 transition-colors"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Position"
                                                            value={player.position || ''}
                                                            onChange={(e) => handleMemberChange('player', index, 'position', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 transition-colors"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember('player', index)}
                                                        className="mt-2 text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        <FiTrash2 className="w-4 h-4 inline mr-1" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Staff Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-white font-outfit">Staff</h3>
                                            <button
                                                type="button"
                                                onClick={() => handleAddMember('staff')}
                                                className="px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center space-x-2"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                                <span>Ajouter</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {(formData.staff as TeamMember[])?.map((member, index) => (
                                                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Nom"
                                                            value={member.name}
                                                            onChange={(e) => handleMemberChange('staff', index, 'name', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 transition-colors"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Rôle"
                                                            value={member.role || ''}
                                                            onChange={(e) => handleMemberChange('staff', index, 'role', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 transition-colors"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember('staff', index)}
                                                        className="mt-2 text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        <FiTrash2 className="w-4 h-4 inline mr-1" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-4 p-6 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-outfit"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4" />
                        <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
