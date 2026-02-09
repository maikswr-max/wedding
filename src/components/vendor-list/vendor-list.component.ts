import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type VendorStatus = 'Researching' | 'Contacted' | 'Booked' | 'Paid';
interface Vendor {
  id: number;
  name: string;
  category: string;
  phone: string;
  email: string;
  status: VendorStatus;
}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">Vendor Management</h2>

      <!-- Add Vendor Form -->
      <details class="bg-gray-50 p-4 rounded-lg mb-6 border">
          <summary class="font-semibold cursor-pointer text-gray-700 hover:text-pink-600">Add New Vendor</summary>
          <form (submit)="addVendor()" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input [(ngModel)]="newVendor.name" name="name" placeholder="Vendor Name" required class="p-2 border rounded-md">
              <input [(ngModel)]="newVendor.category" name="category" placeholder="Category (e.g., Florist)" required class="p-2 border rounded-md">
              <input [(ngModel)]="newVendor.phone" name="phone" placeholder="Phone Number" class="p-2 border rounded-md">
              <input [(ngModel)]="newVendor.email" name="email" type="email" placeholder="Email Address" class="p-2 border rounded-md">
              <select [(ngModel)]="newVendor.status" name="status" class="p-2 border rounded-md">
                  <option>Researching</option>
                  <option>Contacted</option>
                  <option>Booked</option>
                  <option>Paid</option>
              </select>
              <button type="submit" class="md:col-span-2 bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors">Add Vendor</button>
          </form>
      </details>
      
      <!-- Vendor Cards -->
      @if (vendors().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for(vendor of vendors(); track vendor.id) {
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start">
                  <h3 class="text-xl font-bold font-serif text-gray-800">{{ vendor.name }}</h3>
                   <span class="px-2 py-1 text-xs font-medium rounded-full"
                    [class.bg-gray-200]="vendor.status === 'Researching'" [class.text-gray-800]="vendor.status === 'Researching'"
                    [class.bg-blue-200]="vendor.status === 'Contacted'" [class.text-blue-800]="vendor.status === 'Contacted'"
                    [class.bg-purple-200]="vendor.status === 'Booked'" [class.text-purple-800]="vendor.status === 'Booked'"
                    [class.bg-green-200]="vendor.status === 'Paid'" [class.text-green-800]="vendor.status === 'Paid'"
                  >{{ vendor.status }}</span>
                </div>
                <p class="text-sm text-pink-600 font-semibold mb-3">{{ vendor.category }}</p>
                @if(vendor.phone) {
                  <p class="text-sm text-gray-600 flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {{ vendor.phone }}
                  </p>
                }
                @if(vendor.email) {
                  <p class="text-sm text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {{ vendor.email }}
                  </p>
                }
              </div>
              <div class="mt-4 flex justify-end space-x-2">
                 <select [ngModel]="vendor.status" (ngModelChange)="updateVendorStatus(vendor.id, $event)" class="text-xs p-1 border rounded-md w-full">
                    <option>Researching</option>
                    <option>Contacted</option>
                    <option>Booked</option>
                    <option>Paid</option>
                  </select>
                <button (click)="removeVendor(vendor.id)" class="text-gray-400 hover:text-red-600 p-2 bg-gray-100 hover:bg-red-100 rounded-md">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
          <p class="text-center text-gray-500 py-8">No vendors added yet. Add one to get started!</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorListComponent {
  private nextId = 3;
  vendors = signal<Vendor[]>([
    { id: 1, name: 'Evergreen Photography', category: 'Photography', phone: '555-1234', email: 'contact@evergreen.com', status: 'Booked' },
    { id: 2, name: 'The Grand Ballroom', category: 'Venue', phone: '555-5678', email: 'events@grandballroom.com', status: 'Paid' },
    { id: 3, name: 'Blossom & Bloom', category: 'Florist', phone: '555-8765', email: 'info@blossom.com', status: 'Contacted' },
  ]);

  newVendor = this.resetNewVendor();

  addVendor() {
    if (!this.newVendor.name || !this.newVendor.category) return;
    this.vendors.update(vendors => [...vendors, { ...this.newVendor, id: ++this.nextId }]);
    this.newVendor = this.resetNewVendor();
  }
  
  updateVendorStatus(id: number, status: VendorStatus) {
    this.vendors.update(vendors =>
      vendors.map(vendor => (vendor.id === id ? { ...vendor, status } : vendor))
    );
  }

  removeVendor(id: number) {
    this.vendors.update(vendors => vendors.filter(vendor => vendor.id !== id));
  }

  private resetNewVendor() {
    return { name: '', category: '', phone: '', email: '', status: 'Researching' as const };
  }
}
