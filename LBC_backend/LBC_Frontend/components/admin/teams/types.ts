import { Team } from '@/app/lib/api';

export interface CategoryType {
  _id: string;
  name: string;
  hasPoules?: boolean;
  poules?: string[];
}

export interface CreateTeamForm extends Partial<Team> {
  name: string;
  category: string;
  city: string;
  poule?: string;
}

export interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export interface TeamFiltersProps {
  categories: CategoryType[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  hasPoules: boolean;
  poules: string[];
  selectedPoule: string;
  onPouleChange: (poule: string) => void;
}

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  formData: CreateTeamForm;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  createFormHasPoules: boolean;
  createFormPoules: string[];
}
