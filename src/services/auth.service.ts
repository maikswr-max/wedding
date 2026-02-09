import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userStorageKey = 'wedding_planner_user';
  currentUser = signal<string | null>(null);

  constructor() {
    const savedUser = localStorage.getItem(this.userStorageKey);
    if (savedUser) {
      this.currentUser.set(savedUser);
    }
  }

  signIn(name: string) {
    if (!name.trim()) return;
    const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_');
    this.currentUser.set(sanitizedName);
    localStorage.setItem(this.userStorageKey, sanitizedName);
  }

  signOut() {
    this.currentUser.set(null);
    localStorage.removeItem(this.userStorageKey);
  }
}
