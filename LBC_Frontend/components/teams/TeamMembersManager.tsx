'use client';

import { useState } from 'react';
import { TeamMember } from '@/app/lib/api';
import { FiEdit2, FiTrash, FiPlus, FiUser, FiUserCheck, FiX, FiSave } from 'react-icons/fi';

interface TeamMembersManagerProps {
  teamId: string;
  initialMembers: TeamMember[];
  type: 'players' | 'staff';
  onUpdate: (members: TeamMember[]) => Promise<void>;
}

export function TeamMembersManager({ teamId, initialMembers, type, onUpdate }: TeamMembersManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers || []);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (member: TeamMember) => {
    setEditingMember({ 
      ...member,
      ...(member.type === 'player' 
        ? { position: member.position || '', number: member.number || 0 }
        : { role: member.role || '' })
    });
    setIsEditing(member._id || null);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setEditingMember({ 
      name: '',
      ...(type === 'players' 
        ? { position: '', number: 0 } 
        : { role: '' })
    });
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleSave = async () => {
    if (!editingMember) return;
    
    setIsLoading(true);
    try {
      // Ensure type is set correctly
      const memberType = type === 'players' ? 'player' as const : 'staff' as const;
      
      const memberToSave: TeamMember = {
        ...editingMember,
        type: memberType,
        name: editingMember.name || '',
        _id: isEditing && typeof isEditing === 'string' ? isEditing : Date.now().toString(),
        ...(memberType === 'player' 
          ? { position: editingMember.position || '', number: editingMember.number || 0 }
          : { role: editingMember.role || '' })
      };
      
      const updatedMembers = isAdding
        ? [...members, memberToSave]
        : members.map(m => m._id === isEditing ? memberToSave : m);
      
      await onUpdate(updatedMembers);
      setMembers(updatedMembers);
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    setIsLoading(true);
    try {
      const updatedMembers = members.filter(m => m._id !== id);
      await onUpdate(updatedMembers);
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setIsEditing(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {type === 'players' ? (
            <>
              <FiUser className="text-orange-400" /> Players
            </>
          ) : (
            <>
              <FiUserCheck className="text-blue-400" /> Staff
            </>
          )}
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          <FiPlus size={16} /> Add {type === 'players' ? 'Player' : 'Staff'}
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editingMember?.name || ''}
                onChange={(e) => setEditingMember({ ...editingMember!, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Full name"
              />
            </div>

            {type === 'players' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Number</label>
                  <input
                    type="number"
                    value={editingMember?.number || ''}
                    onChange={(e) => setEditingMember({ 
                      ...editingMember!, 
                      number: parseInt(e.target.value) || 0 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Jersey number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={editingMember?.position || ''}
                    onChange={(e) => setEditingMember({ ...editingMember!, position: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Position (e.g., Point Guard)"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <input
                  type="text"
                  value={editingMember?.role || ''}
                  onChange={(e) => setEditingMember({ ...editingMember!, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Role (e.g., Head Coach)"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1"
              disabled={isLoading || !editingMember?.name}
            >
              <FiSave size={16} />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No {type} added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {type === 'players' && <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {type === 'players' ? 'Position' : 'Role'}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {members.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-750">
                    {type === 'players' && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-300">
                        {member.number || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {type === 'players' ? member.position : member.role}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => member._id && handleDelete(member._id)}
                          className="text-red-500 hover:text-red-400"
                          title="Delete"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
