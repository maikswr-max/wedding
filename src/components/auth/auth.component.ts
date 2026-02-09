import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-pink-50/30">
      <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <div>
          <h1 class="text-3xl font-bold font-serif text-gray-800 text-center">Wedding Planner</h1>
          <p class="mt-2 text-center text-sm text-gray-600">
            Sign in to plan your perfect day
          </p>
        </div>
        <form class="mt-8 space-y-6" (submit)="signIn()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="name" class="sr-only">Your Name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                [(ngModel)]="name"
                class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
                placeholder="Enter your name">
            </div>
          </div>
          <div>
            <button 
              type="submit" 
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Sign In & Start Planning
            </button>
          </div>
        </form>

        <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink mx-4 text-xs text-gray-400 uppercase">Or</span>
            <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <div>
            <button 
                (click)="signInAsGuest()"
                type="button"
                class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
                Continue as Guest
            </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private authService = inject(AuthService);
  name = '';

  signIn() {
    this.authService.signIn(this.name);
  }

  signInAsGuest() {
    this.authService.signIn('Guest');
  }
}
