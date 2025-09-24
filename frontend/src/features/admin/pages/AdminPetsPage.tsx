import React, { useState, useEffect } from 'react';
import { PetCard, PetForm } from '../../shared/components';
import { adminPetsApi } from '../../shared/api/petsApi';
import type { Pet, PetSummary, CreatePetRequest, UpdatePetRequest } from '../../shared/types/pet';

interface CreatePetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerUserId: string;
}

const CreatePetModal: React.FC<CreatePetModalProps> = ({ isOpen, onClose, onSuccess, ownerUserId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePetRequest | UpdatePetRequest) => {
    setIsLoading(true);
    try {
      await adminPetsApi.create(data as CreatePetRequest);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create pet:', error);
      alert('Failed to create pet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Pet</h2>
          <PetForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            ownerUserId={ownerUserId}
          />
        </div>
      </div>
    </div>
  );
};

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pet: Pet;
}

const EditPetModal: React.FC<EditPetModalProps> = ({ isOpen, onClose, onSuccess, pet }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePetRequest | UpdatePetRequest) => {
    setIsLoading(true);
    try {
      await adminPetsApi.update(pet.id, data as UpdatePetRequest);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update pet:', error);
      alert('Failed to update pet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Pet</h2>
          <PetForm
            mode="edit"
            initialData={pet}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

interface AssignPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pet: Pet;
}

const AssignPetModal: React.FC<AssignPetModalProps> = ({ isOpen, onClose, onSuccess, pet }) => {
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerUserId.trim()) {
      alert('Please enter a valid owner user ID');
      return;
    }

    setIsLoading(true);
    try {
      await adminPetsApi.assign({
        petId: pet.id,
        newOwnerUserId: newOwnerUserId.trim()
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to assign pet:', error);
      alert('Failed to assign pet. Please check the user ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Assign Pet to New Owner</h2>
          <p className="text-gray-600 mb-4">
            Assigning <strong>{pet.name}</strong> to a new owner.
            Current owner: <strong>{pet.ownerFullName}</strong>
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="newOwnerUserId" className="block text-sm font-medium text-gray-700 mb-1">
                New Owner User ID *
              </label>
              <input
                type="text"
                id="newOwnerUserId"
                value={newOwnerUserId}
                onChange={(e) => setNewOwnerUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new owner's user ID"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Assigning...' : 'Assign Pet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AdminPetsPage: React.FC = () => {
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [newPetOwnerUserId, setNewPetOwnerUserId] = useState('');

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminPetsApi.getAll();
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
      setError('Failed to load pets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pet: PetSummary) => {
    if (!confirm(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminPetsApi.delete(pet.id);
      await loadPets(); // Reload the list
    } catch (error) {
      console.error('Failed to delete pet:', error);
      alert('Failed to delete pet. Please try again.');
    }
  };

  const handleEdit = async (pet: PetSummary) => {
    try {
      // Fetch full pet details for editing
      const fullPet = await adminPetsApi.getById(pet.id);
      if (fullPet) {
        setSelectedPet(fullPet);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load pet details:', error);
      alert('Failed to load pet details. Please try again.');
    }
  };

  const handleAssign = async (pet: PetSummary) => {
    try {
      // Fetch full pet details for assignment
      const fullPet = await adminPetsApi.getById(pet.id);
      if (fullPet) {
        setSelectedPet(fullPet);
        setIsAssignModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to load pet details:', error);
      alert('Failed to load pet details. Please try again.');
    }
  };

  const handleCreatePet = () => {
    if (!newPetOwnerUserId.trim()) {
      const userId = prompt('Enter the owner\'s user ID:');
      if (!userId) return;
      setNewPetOwnerUserId(userId);
    }
    setIsCreateModalOpen(true);
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.ownerFullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading pets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pet Management</h1>
        <button
          onClick={handleCreatePet}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Pet
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search pets by name, breed, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadPets}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Pets Grid */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No pets found matching your search.' : 'No pets found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              showOwner={true}
              onEdit={() => handleEdit(pet)}
              onDelete={() => handleDelete(pet)}
              onAssign={() => handleAssign(pet)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadPets}
        ownerUserId={newPetOwnerUserId}
      />

      {selectedPet && (
        <>
          <EditPetModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPet(null);
            }}
            onSuccess={loadPets}
            pet={selectedPet}
          />

          <AssignPetModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedPet(null);
            }}
            onSuccess={loadPets}
            pet={selectedPet}
          />
        </>
      )}
    </div>
  );
};