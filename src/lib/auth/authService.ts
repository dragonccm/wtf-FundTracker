'use client';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  provider: 'local' | 'google';
  createdAt: string;
  lastLoginAt?: string;
}

const STORAGE_KEYS = {
  USERS: 'nhatkyquy_registered_users',
  RECENT_ACCOUNTS: 'nhatkyquy_recent_accounts',
  REMEMBERED_EMAIL: 'nhatkyquy_remembered_email',
};

// Seed Users list (Empty by default for real user registration)
const INITIAL_USERS: UserAccount[] = [];

export const authService = {
  // Get all registered users
  getRegisteredUsers(): UserAccount[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get registered users:', e);
      return INITIAL_USERS;
    }
  },

  // Save registered users list
  saveRegisteredUsers(users: UserAccount[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  // Register new user account
  registerUser(params: {
    name: string;
    email: string;
    password: string;
    avatarUrl?: string;
    provider?: 'local' | 'google';
  }): { success: boolean; user?: UserAccount; error?: string } {
    const email = params.email.trim().toLowerCase();
    const name = params.name.trim();

    if (!name) {
      return { success: false, error: 'Vui lòng nhập họ và tên của bạn.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Địa chỉ email không đúng định dạng.' };
    }

    if (!params.password || params.password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' };
    }

    const users = this.getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email);

    if (existing) {
      return {
        success: false,
        error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng email khác.',
      };
    }

    const newUser: UserAccount = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      email,
      password: params.password,
      avatarUrl:
        params.avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6750A4,625B71,7D5260`,
      provider: params.provider || 'local',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);
    this.saveRecentAccount(newUser);

    return { success: true, user: newUser };
  },

  // Authenticate user with Email and Password
  authenticateUser(
    emailInput: string,
    passwordInput: string
  ): { success: boolean; user?: UserAccount; error?: string } {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email) {
      return { success: false, error: 'Vui lòng nhập địa chỉ email.' };
    }
    if (!password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu.' };
    }

    const users = this.getRegisteredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      return {
        success: false,
        error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.',
      };
    }

    // Check password
    if (user.password && user.password !== password) {
      return {
        success: false,
        error: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại (Mẹo: Mật khẩu mặc định là 123456 hoặc password123).',
      };
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    this.saveRegisteredUsers(users);
    this.saveRecentAccount(user);

    return { success: true, user };
  },

  // Reset user password
  resetPassword(
    emailInput: string,
    newPasswordInput: string
  ): { success: boolean; error?: string } {
    const email = emailInput.trim().toLowerCase();
    const newPassword = newPasswordInput.trim();

    if (!email) return { success: false, error: 'Vui lòng nhập email.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    const users = this.getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email);

    if (userIndex === -1) {
      return { success: false, error: 'Không tìm thấy tài khoản tương ứng với email này.' };
    }

    users[userIndex].password = newPassword;
    this.saveRegisteredUsers(users);

    return { success: true };
  },

  // Google Login / Sync
  googleLogin(googleData: {
    email: string;
    name?: string;
    avatarUrl?: string;
  }): UserAccount {
    const email = googleData.email.trim().toLowerCase();
    const name = googleData.name || email.split('@')[0];
    const users = this.getRegisteredUsers();

    let user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      user = {
        id: 'usr_g_' + Date.now(),
        name,
        email,
        avatarUrl:
          googleData.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4285F4`,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
    } else {
      user.name = name;
      if (googleData.avatarUrl) user.avatarUrl = googleData.avatarUrl;
      user.provider = 'google';
      user.lastLoginAt = new Date().toISOString();
    }

    this.saveRegisteredUsers(users);
    this.saveRecentAccount(user);
    return user;
  },

  // Get recent saved accounts on this device
  getRecentAccounts(): UserAccount[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_ACCOUNTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveRecentAccount(user: UserAccount) {
    if (typeof window === 'undefined') return;
    try {
      let recent = this.getRecentAccounts();
      recent = recent.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
      recent.unshift(user);
      // Keep up to 5 recent accounts
      recent = recent.slice(0, 5);
      localStorage.setItem(STORAGE_KEYS.RECENT_ACCOUNTS, JSON.stringify(recent));
    } catch (e) {
      console.error('Failed to save recent account:', e);
    }
  },

  removeRecentAccount(email: string) {
    if (typeof window === 'undefined') return;
    try {
      let recent = this.getRecentAccounts();
      recent = recent.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(STORAGE_KEYS.RECENT_ACCOUNTS, JSON.stringify(recent));
    } catch (e) {}
  },

  getRememberedEmail(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';
  },

  setRememberedEmail(email: string) {
    if (typeof window === 'undefined') return;
    if (email) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }
  },
};
