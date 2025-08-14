'use client';
import Image from 'next/image';


import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthContext';
import { FiUser, FiMail, FiEdit3, FiLogOut, FiSave, FiX, FiSettings } from 'react-icons/fi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut, updateProfile } = useAuth();

  const [formData, setFormData] = useState<{
    name: string;
    bio: string;
    avatar: string;
    preferences: {
      theme: string;
      language: string;
      categories: string[];
    };
  }>({
    name: '',
    bio: '',
    avatar: '',
    preferences: {
      theme: 'light',
      language: 'en',
      categories: [],
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        preferences: {
          theme: user.preferences?.theme || 'light',
          language: user.preferences?.language || 'en',
          categories: user.preferences?.categories || [],
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh]">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Profile Information */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiEdit3 size={14} className="text-white" />
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <FiEdit3 size={14} className="text-white" style={{ color: 'white' }} />
                  <span className="text-white">Edit</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                  <FiMail size={16} />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg min-h-[80px]">
                    {formData.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {formData.avatar ? (
                        <Image
                          src={formData.avatar}
                          alt="Avatar"
                          width={48}
                          height={48}
                          className="w-full h-full rounded-full object-cover"
                          priority
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {formData.name.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{formData.avatar || 'No avatar set'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiSettings className="text-blue-600" />
              Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferences.theme}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg capitalize">
                    {formData.preferences.theme}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg capitalize">
                    {formData.preferences.language === 'en' ? 'English' : 
                     formData.preferences.language === 'es' ? 'Spanish' :
                     formData.preferences.language === 'fr' ? 'French' :
                     formData.preferences.language === 'de' ? 'German' : formData.preferences.language}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut size={16} />
              Sign Out
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                <FiSave size={16} className="text-white" style={{ color: 'white' }} />
                <span className="text-white">{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
