
export type UserRole = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  company?: string;
}

// Mock authentication service
class AuthService {
  private readonly STORAGE_KEY = 'i-numa-auth';
  private readonly USERS_KEY = 'i-numa-users';

  // Get initial users or create if not exist
  private getInitialUsers(): User[] {
    const storedUsers = localStorage.getItem(this.USERS_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    
    // Create initial set of users
    const initialUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@inuma.com',
        role: 'admin',
        isEmailVerified: true
      },
      {
        id: '2',
        name: 'Agent User',
        email: 'agent@inuma.com',
        role: 'agent',
        isEmailVerified: true
      },
      {
        id: '3',
        name: 'Client User',
        email: 'client@inuma.com',
        role: 'client',
        isEmailVerified: true,
        company: 'ABC Corporation'
      }
    ];
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  
  // Get current user
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  
  // Set current user
  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  // Login user
  login(email: string, password: string): { success: boolean; message: string } {
    // In a real app, we would validate the password
    const users = this.getInitialUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (!user.isEmailVerified) {
      return { success: false, message: 'Please verify your email first' };
    }
    
    this.setCurrentUser(user);
    return { success: true, message: 'Login successful' };
  }
  
  // Register new user
  register(name: string, email: string, password: string, company?: string): { success: boolean; message: string } {
    const users = this.getInitialUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'client', // New users are always clients
      isEmailVerified: false,
      company
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    // In a real app, we would send verification email
    return { success: true, message: 'Registration successful! Please check your email for verification.' };
  }
  
  // Verify email
  verifyEmail(email: string): { success: boolean; message: string } {
    const users = this.getInitialUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    users[userIndex].isEmailVerified = true;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    return { success: true, message: 'Email verified successfully! You can now log in.' };
  }
  
  // Logout user
  logout(): void {
    this.setCurrentUser(null);
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get user role
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}

export const authService = new AuthService();
