import React, { useState, useEffect } from 'react';
import { PetCard } from '../../shared/components';
import { petsApi } from '../../shared/api/petsApi';
import type { Pet } from '../../shared/types/pet';
import { debugToken } from '../../../utils/tokenDebug';

interface PetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
}

const PetDetailsModal: React.FC<PetDetailsModalProps> = ({ isOpen, onClose, pet }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">{pet.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Species</label>
                <p className="text-gray-900">{pet.species}</p>
              </div>
              {pet.breed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Breed</label>
                  <p className="text-gray-900">{pet.breed}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {pet.dateOfBirth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">{new Date(pet.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              {pet.ageInYears !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="text-gray-900">{pet.ageInYears} years old</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {pet.color && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <p className="text-gray-900">{pet.color}</p>
                </div>
              )}
              {pet.weight && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <p className="text-gray-900">{pet.weight} kg</p>
                </div>
              )}
            </div>

            {/* Medical Notes */}
            {pet.medicalNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes</label>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-gray-900 whitespace-pre-wrap">{pet.medicalNotes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label className="block font-medium">Created</label>
                  <p>{new Date(pet.createdAt).toLocaleDateString()}</p>
                </div>
                {pet.updatedAt && (
                  <div>
                    <label className="block font-medium">Last Updated</label>
                    <p>{new Date(pet.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OwnerPetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadMyPets();
    // Debug token information
    debugToken();
  }, []);

  const loadMyPets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Debug: Check if token exists
      const token = localStorage.getItem('APP_AT');
      console.log('Token check - Token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 50) + '...');
      }
      
      // Debug: Test backend claims
      try {
        console.log('Testing backend claims...');
        const debugInfo = await petsApi.debugMe();
        console.log('Backend debug info:', debugInfo);
      } catch (debugError) {
        console.error('Backend debug failed:', debugError);
      }
      
      const data = await petsApi.getMy();
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
      setError('Failed to load your pets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailsModalOpen(true);
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePets = filteredPets.filter(pet => pet.isActive);
  const inactivePets = filteredPets.filter(pet => !pet.isActive);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
        <p className="text-gray-600 mt-1">Manage and view your pet's information</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search your pets by name or breed..."
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
            onClick={loadMyPets}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Active Pets */}
      {activePets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Pets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                showOwner={false}
                onView={() => handleViewDetails(pet)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Pets */}
      {inactivePets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inactive Pets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactivePets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                showOwner={false}
                onView={() => handleViewDetails(pet)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pets.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🐾</div>
          <p className="text-gray-500 text-lg mb-2">You don't have any pets yet.</p>
          <p className="text-gray-400">Contact your veterinarian to add your pets to the system.</p>
        </div>
      )}

      {/* No Search Results */}
      {filteredPets.length === 0 && pets.length > 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pets found matching "{searchTerm}".</p>
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <PetDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPet(null);
          }}
          pet={selectedPet}
        />
      )}
    </div>
  );
};