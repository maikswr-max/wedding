import { ChangeDetectionStrategy, Component, computed, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

type RsvpStatus = 'Pending' | 'Attending' | 'Declined';
interface Guest {
  id: number;
  name: string;
  status: RsvpStatus;
  side: 'Bride' | 'Groom' | 'Both';
  notes: string;
}

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">Guest List</h2>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
        <div class="p-4 bg-gray-100 rounded-lg">
          <p class="text-2xl font-bold text-gray-800">{{ guestStats().total }}</p>
          <p class="text-sm text-gray-600">Total Guests</p>
        </div>
        <div class="p-4 bg-green-100 rounded-lg">
          <p class="text-2xl font-bold text-green-800">{{ guestStats().attending }}</p>
          <p class="text-sm text-green-600">Attending</p>
        </div>
        <div class="p-4 bg-red-100 rounded-lg">
          <p class="text-2xl font-bold text-red-800">{{ guestStats().declined }}</p>
          <p class="text-sm text-red-600">Declined</p>
        </div>
        <div class="p-4 bg-yellow-100 rounded-lg">
          <p class="text-2xl font-bold text-yellow-800">{{ guestStats().pending }}</p>
          <p class="text-sm text-yellow-600">Pending</p>
        </div>
      </div>

      <!-- Add Guest Form -->
      <details class="bg-gray-50 p-4 rounded-lg mb-6 border">
          <summary class="font-semibold cursor-pointer text-gray-700 hover:text-pink-600">Add New Guest</summary>
          <form (submit)="addGuest()" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input [(ngModel)]="newGuest.name" name="name" placeholder="Full Name" required class="p-2 border rounded-md col-span-1 md:col-span-3">
              <select [(ngModel)]="newGuest.side" name="side" class="p-2 border rounded-md">
                  <option>Bride</option>
                  <option>Groom</option>
                  <option>Both</option>
              </select>
              <select [(ngModel)]="newGuest.status" name="status" class="p-2 border rounded-md">
                  <option>Pending</option>
                  <option>Attending</option>
                  <option>Declined</option>
              </select>
              <button type="submit" class="bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors">Add Guest</button>
          </form>
      </details>
      
      <!-- Guest Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left py-3 px-4 font-semibold text-sm">Name</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Side</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">RSVP Status</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            @for(guest of guests(); track guest.id) {
              <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-3 px-4">{{ guest.name }}</td>
                <td class="py-3 px-4">{{ guest.side }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                    [class.bg-yellow-200]="guest.status === 'Pending'"
                    [class.text-yellow-800]="guest.status === 'Pending'"
                    [class.bg-green-200]="guest.status === 'Attending'"
                    [class.text-green-800]="guest.status === 'Attending'"
                    [class.bg-red-200]="guest.status === 'Declined'"
                    [class.text-red-800]="guest.status === 'Declined'"
                  >{{ guest.status }}</span>
                </td>
                <td class="py-3 px-4 flex items-center space-x-2">
                    <select [ngModel]="guest.status" (ngModelChange)="updateGuestStatus(guest.id, $event)" class="text-xs p-1 border rounded-md">
                      <option>Pending</option>
                      <option>Attending</option>
                      <option>Declined</option>
                    </select>
                    <button (click)="removeGuest(guest.id)" class="text-gray-400 hover:text-red-600 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="text-center py-8 text-gray-500">No guests have been added yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestListComponent {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private storageKey = computed(() => `wedding_guests_${this.currentUser()}`);

  private nextId = 0;
  guests = signal<Guest[]>([]);
  newGuest = { name: '', side: 'Bride' as const, status: 'Pending' as const };

  guestStats = computed(() => {
    const guestList = this.guests();
    return {
      total: guestList.length,
      attending: guestList.filter(g => g.status === 'Attending').length,
      declined: guestList.filter(g => g.status === 'Declined').length,
      pending: guestList.filter(g => g.status === 'Pending').length,
    };
  });
  
  constructor() {
    effect(() => {
      this.guests.set(this.loadGuests());
      this.nextId = this.guests().reduce((max, guest) => Math.max(max, guest.id), -1) + 1;
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.currentUser()) {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.guests()));
      }
    });
  }
  
  private loadGuests(): Guest[] {
    if (!this.currentUser()) return this.getDefaultGuests();

    const savedGuests = localStorage.getItem(this.storageKey());
    if(savedGuests) {
      try {
        return JSON.parse(savedGuests);
      } catch(e) {
        console.error('Error parsing guests from localStorage', e);
        return this.getDefaultGuests();
      }
    }
    return this.getDefaultGuests();
  }
  
  private getDefaultGuests(): Guest[] {
    return [
      { id: 1, name: 'John Doe', status: 'Attending', side: 'Groom', notes: '' },
      { id: 2, name: 'Jane Smith', status: 'Attending', side: 'Bride', notes: '' },
      { id: 3, name: 'Peter Jones', status: 'Pending', side: 'Bride', notes: '' },
      { id: 4, name: 'Mary Williams', status: 'Declined', side: 'Groom', notes: '' },
    ];
  }

  addGuest() {
    if (this.newGuest.name.trim() === '') return;
    this.guests.update(guests => [
      ...guests,
      { 
        id: ++this.nextId, 
        name: this.newGuest.name, 
        status: this.newGuest.status, 
        side: this.newGuest.side, 
        notes: '' 
      }
    ]);
    this.newGuest = { name: '', side: 'Bride', status: 'Pending' };
  }

  updateGuestStatus(id: number, status: RsvpStatus) {
    this.guests.update(guests =>
      guests.map(guest => (guest.id === id ? { ...guest, status } : guest))
    );
  }

  removeGuest(id: number) {
    this.guests.update(guests => guests.filter(guest => guest.id !== id));
  }
}
