import { useState } from 'react';
import type { BabyProfile as BabyProfileType } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface BabyProfileProps {
  profile: BabyProfileType | null;
  onSave: (data: Omit<BabyProfileType, 'id'>) => void;
  onUpdate: (data: Partial<Omit<BabyProfileType, 'id'>>) => void;
}

export function BabyProfile({ profile, onSave, onUpdate }: BabyProfileProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || 'other' as const,
    weight: profile?.weight || 0,
    height: profile?.height || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      onUpdate(formData);
    } else {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  if (!profile && !isEditing) {
    return (
      <div className="card p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-soft)] flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] mb-4 font-display">No baby profile yet</p>
        <button onClick={() => setIsEditing(true)} className="btn btn-nap">
          Create Profile
        </button>
      </div>
    );
  }

  if (isEditing || !profile) {
    return (
      <div className="card p-6">
        <h2 className="text-display-sm mb-6">
          {profile ? 'Edit Profile' : 'Create Baby Profile'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Baby's Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter name..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="male">Boy</option>
              <option value="female">Girl</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="0.0"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 font-display">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="0.0"
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-nap flex-1">
              Save Profile
            </button>
            {profile && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: profile.name,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    weight: profile.weight,
                    height: profile.height,
                  });
                  setIsEditing(false);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[var(--nap-color)]/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl font-bold text-[var(--nap-color)]">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h2 className="text-display-sm truncate">{profile.name}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[var(--nap-color)] text-sm font-medium font-display"
            >
              Edit
            </button>
          </div>

          <p className="text-[var(--nap-color)] font-display font-medium mt-1">
            {calculateAge(profile.dateOfBirth)} old
          </p>

          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-sm text-[var(--text-muted)]">
              {profile.gender === 'male' ? 'Boy' : profile.gender === 'female' ? 'Girl' : 'Other'}
            </span>
            {profile.weight > 0 && (
              <span className="text-sm text-[var(--text-muted)]">
                {profile.weight} kg
              </span>
            )}
            {profile.height > 0 && (
              <span className="text-sm text-[var(--text-muted)]">
                {profile.height} cm
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
