import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { Team } from '@/app/lib/api';
import { TeamCard } from './TeamCard';
import { TeamFilters } from './TeamFilters';
import { CreateTeamModal } from './CreateTeamModal';
import { CategoryType } from './types';

interface TeamsListProps {
  teams: Team[];
  categories: CategoryType[];
  onTeamEdit: (team: Team) => void;
  onTeamDelete: (teamId: string) => Promise<boolean>;
  onCreateTeam: (team: any) => Promise<Team>;
}

export function TeamsList({
  teams,
  categories,
  onTeamEdit,
  onTeamDelete,
  onCreateTeam,
}: TeamsListProps) {
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [selectedPoule, setSelectedPoule] = useState('A');
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: '',
    city: '',
    poule: 'A',
  });

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === selectedCategory);
  const hasPoules = currentCategory?.hasPoules || false;
  const poules = currentCategory?.poules || ['A', 'B', 'C', 'D'];

  // Ensure teams is an array before filtering
  const safeTeams = Array.isArray(teams) ? teams : [];
  
  // Debug: Log the teams and categories
  console.log('Teams:', safeTeams);
  console.log('Categories:', categories);
  console.log('Selected Category:', selectedCategory);
  console.log('Current Category:', currentCategory);
  console.log('Has Poules:', hasPoules);
  console.log('Poules:', poules);
  console.log('Selected Poule:', selectedPoule);

  // Filter teams based on selected category and poule
  const filteredTeams = safeTeams.filter(team => {
    if (!team) {
      console.log('Skipping null/undefined team');
      return false;
    }

    // Log team details for debugging
    console.log(`Checking team: ${team.name} (Category: ${team.category}, Poule: ${team.poule})`);
    
    // Handle 'All Categories' case
    if (selectedCategory === 'Toutes les catégories') {
      // If showing all categories, only filter by poule if hasPoules is true
      if (hasPoules && selectedPoule !== 'Toutes les poules') {
        const pouleMatch = team.poule && team.poule.toString().toUpperCase() === selectedPoule.toUpperCase();
        if (pouleMatch) {
          console.log(`Including team in 'All Categories' with matching poule: ${team.name}`);
          return true;
        }
        console.log(`Excluding team: ${team.name} - Poule doesn't match (${team.poule} vs ${selectedPoule})`);
        return false;
      }
      console.log(`Including team in 'All Categories': ${team.name}`);
      return true;
    }

    // Handle specific category selection
    if (team.category && team.category.trim() === selectedCategory.trim()) {
      // If category matches, check poule if needed
      if (hasPoules && selectedPoule !== 'Toutes les poules') {
        const pouleMatch = team.poule && team.poule.toString().toUpperCase() === selectedPoule.toUpperCase();
        if (pouleMatch) {
          console.log(`Including team with matching category and poule: ${team.name}`);
          return true;
        }
        console.log(`Excluding team: ${team.name} - Category matches but poule doesn't (${team.poule} vs ${selectedPoule})`);
        return false;
      }
      console.log(`Including team with matching category: ${team.name}`);
      return true;
    }

    console.log(`Excluding team: ${team.name} - Category doesn't match (${team.category} vs ${selectedCategory})`);
    return false;
  });
  
  console.log('Filtered Teams:', {
    count: filteredTeams.length,
    total: safeTeams.length,
    selectedCategory,
    selectedPoule,
    hasPoules,
    sample: filteredTeams.slice(0, 3).map(t => ({
      name: t.name,
      category: t.category,
      poule: t.poule,
      id: t._id
    }))
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateTeam(createForm);
      setIsCreating(false);
      setCreateForm({ name: '', category: '', city: '', poule: 'A' });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  // Get category for create form
  const createFormCategory = categories.find(cat => cat.name === createForm.category);
  const createFormHasPoules = createFormCategory?.hasPoules || false;
  const createFormPoules = createFormCategory?.poules || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Gestion des équipes</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
        >
          <FiPlus />
          Créer une équipe
        </button>
      </div>

      <TeamFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        hasPoules={hasPoules}
        poules={poules}
        selectedPoule={selectedPoule}
        onPouleChange={setSelectedPoule}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTeams.map(team => (
          <TeamCard
            key={team._id}
            team={team}
            onEdit={onTeamEdit}
            onDelete={onTeamDelete}
          />
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl">
          <FiUsers className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-white">Aucune équipe trouvée</h3>
          <p className="mt-1 text-sm text-gray-400">
            {selectedCategory !== 'Toutes les catégories'
              ? `Aucune équipe dans la catégorie ${selectedCategory}`
              : 'Aucune équipe enregistrée pour le moment'}
          </p>
        </div>
      )}

      <CreateTeamModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        categories={categories}
        formData={createForm}
        onFormChange={handleFormChange}
        onSubmit={handleCreateSubmit}
        createFormHasPoules={createFormHasPoules}
        createFormPoules={createFormPoules}
      />
    </div>
  );
}
