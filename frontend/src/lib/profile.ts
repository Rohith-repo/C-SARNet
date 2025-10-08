import { User } from './api';

export async function updateUserProfile(user: User): Promise<User> {
  const response = await fetch('/api/users/me/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/users/me/avatar/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile image');
  }

  const data = await response.json();
  return data.avatar_url;
}

export interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'completed' | 'processing' | 'failed';
  fileSize: string;
  downloadUrl?: string;
}

export async function getUserUploadHistory(): Promise<UploadHistory[]> {
  const response = await fetch('/api/users/me/uploads/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch upload history');
  }

  return response.json();
}