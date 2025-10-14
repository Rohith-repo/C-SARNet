// API client for frontend-backend connectivity

export const API_URL: string = 
  (import.meta as any)?.env?.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : 'http://localhost:8000/api');

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API request helper with auth
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_URL.replace(/\/$/, '')}${endpoint}`;
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle token refresh if needed
  if (response.status === 401 && token) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL.replace(/\/$/, '')}/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setToken(data.access);
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${data.access}`;
          return fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      } catch (error) {
        clearTokens();
        throw new Error('Session expired. Please login again.');
      }
    }
  }

  return response;
}

// Health check
export async function health(): Promise<{ status: string }> {
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/health/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Health check failed: HTTP ${response.status}`);
  }
  
  return response.json();
}

// Authentication
export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export async function login(data: LoginData): Promise<{ user: User; access?: string; refresh?: string }> {
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    let errorText = 'Login failed';
    try {
      const error = await response.json();
      errorText = error.detail || error.non_field_errors?.[0] || error.email?.[0] || error.password?.[0] || errorText;
    } catch {}
    throw new Error(errorText);
  }

  const result = await response.json();

  // dj-rest-auth + simplejwt typically returns { access, refresh }
  let access = result.access || result.access_token || result.accessToken;
  let refresh = result.refresh || result.refresh_token || result.refreshToken;

  // Fallback: if tokens aren't in login response, obtain pair via SimpleJWT
  if (!access || !refresh) {
    const ident = data.email || data.username;
    if (!ident) {
      throw new Error('Email/username missing for token retrieval');
    }
    const tokenResp = await fetch(`${API_URL.replace(/\/$/, '')}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ident, password: data.password }),
    });
    if (!tokenResp.ok) {
      let tmsg = `Token request failed: HTTP ${tokenResp.status}`;
      try { const terr = await tokenResp.json(); tmsg = terr.detail || JSON.stringify(terr); } catch {}
      throw new Error(tmsg);
    }
    const tjson = await tokenResp.json();
    access = tjson.access;
    refresh = tjson.refresh;
  }

  if (access) setToken(access);
  if (refresh) setRefreshToken(refresh);

  // Fetch current user info after login
  const user = await getCurrentUser();
  return { user, access, refresh };
}

export async function register(data: RegisterData): Promise<{ user?: User; access?: string; refresh?: string; needsVerification?: boolean; detail?: string }> {
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/registration/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    let errmsg = 'Registration failed';
    try {
      const error = await response.json();
      errmsg = error.email?.[0] || error.password1?.[0] || error.non_field_errors?.[0] || errmsg;
    } catch {}
    throw new Error(errmsg);
  }

  const result = await response.json();

  // Some setups require email verification and only return a detail message
  if (result.detail && !result.access && !result.access_token) {
    return { needsVerification: true, detail: result.detail };
  }

  const access = result.access || result.access_token || result.accessToken;
  const refresh = result.refresh || result.refresh_token || result.refreshToken;

  if (access) setToken(access);
  if (refresh) setRefreshToken(refresh);

  // Fetch user after successful registration (if tokens present)
  const user = await getCurrentUser();
  return { user, access, refresh };
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  
  if (refreshToken) {
    try {
      await fetch(`${API_URL.replace(/\/$/, '')}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearTokens();
}

// Update getCurrentUser to return avatar URL
export async function getCurrentUser(): Promise<User> {
  let response = await apiRequest('/users/me/');
  if (response.ok) {
    const data = await response.json();
    return {
      id: String(data.id || data.pk),
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      date_joined: data.date_joined || new Date().toISOString(),
      date_of_birth: data.date_of_birth || null,
      avatar: data.avatar ? `${API_URL.replace('/api', '')}${data.avatar}` : null, // ✅ Full URL
    } as User;
  }

  // Fallback...
  const fallback = await apiRequest('/auth/user/');
  if (fallback.ok) {
    const data = await fallback.json();
    return {
      id: String(data.id || data.pk),
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      date_joined: data.date_joined || new Date().toISOString(),
      date_of_birth: data.date_of_birth || null,
      avatar: data.avatar ? `${API_URL.replace('/api', '')}${data.avatar}` : null,
    } as User;
  }

  let detail = `${response.status} ${response.statusText}`;
  try {
    const body = await response.json();
    detail = body.detail || body.error || JSON.stringify(body);
  } catch {}
  throw new Error(`Failed to get user info: ${detail}`);
}

// Update User interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  date_of_birth?: string | null;
  avatar?: string | null;
}



// File upload for image processing
export async function uploadImage(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = getToken();
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/images/`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

// Processing jobs
export async function createProcessingJob(imageId: string): Promise<any> {
  const response = await apiRequest('/processing-jobs/', {
    method: 'POST',
    body: JSON.stringify({
      image_id: imageId,
      job_type: 'colorization',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create processing job');
  }

  return response.json();
}

export async function getProcessingJob(jobId: string): Promise<any> {
  const response = await apiRequest(`/processing-jobs/${jobId}/`);

  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}

// Add this to your existing src/lib/api.ts file

// SAR Image Colorization (direct prediction endpoint)
export async function colorizeImage(file: File): Promise<{ colorized_image: string }> {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = getToken();
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/predict/`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Colorization failed');
  }

  return response.json();
}

// Get user sessions/history
export async function getSessions(): Promise<any> {
  const response = await apiRequest('/sessions/');

  if (!response.ok) {
    throw new Error('Failed to get sessions');
  }

  return response.json();
}

// Get images
export async function getImages(): Promise<any> {
  const response = await apiRequest('/images/');

  if (!response.ok) {
    throw new Error('Failed to get images');
  }

  return response.json();
}

// Add these functions to your existing src/lib/api.ts

// Update user profile
export async function updateUser(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
}): Promise<any> {
  const response = await apiRequest('/users/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update profile');
  }

  return response.json();
}

// Update user avatar
export async function updateUserAvatar(formData: FormData): Promise<any> {
  const token = getToken();
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/users/avatar/`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update avatar');
  }

  return response.json();
}

// Get user statistics
export async function getUserStats(): Promise<{
  imagesProcessed: number;
  totalSessions: number;
  memberSince: string;
}> {
  try {
    const [userInfo, sessions, images] = await Promise.all([
      getCurrentUser(),
      getSessions(),
      getImages(),
    ]);

    return {
      imagesProcessed: Array.isArray(images) ? images.length : 0,
      totalSessions: Array.isArray(sessions) ? sessions.length : 0,
      memberSince: userInfo.date_joined || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return {
      imagesProcessed: 0,
      totalSessions: 0,
      memberSince: new Date().toISOString(),
    };
  }
}

// api.ts
export async function getUserById(userId: number) {
  const res = await fetch(`/api/users/${userId}/`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json(); // should return user info including avatar
}
