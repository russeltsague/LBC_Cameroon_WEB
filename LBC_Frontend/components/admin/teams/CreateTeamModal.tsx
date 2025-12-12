import { FiX } from 'react-icons/fi';
import { CreateTeamModalProps } from './types';

export function CreateTeamModal({
  isOpen,
  onClose,
  categories,
  formData,
  onFormChange,
  onSubmit,
  createFormHasPoules,
  createFormPoules,
}: CreateTeamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Créer une équipe</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Fermer"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom de l'équipe
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={onFormChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onFormChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {createFormHasPoules && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Poule
                </label>
                <select
                  name="poule"
                  value={formData.poule}
                  onChange={onFormChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {createFormPoules.map((poule) => (
                    <option key={poule} value={poule}>
                      Poule {poule}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
