import { ChangeDetectionStrategy, Component, signal, inject, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VendorService, DirectoryVendor } from '../../services/vendor.service';
import { AuthService } from '../../services/auth.service';

type VendorStatus = 'Researching' | 'Contacted' | 'Booked' | 'Paid';
interface Vendor {
  id: number;
  name: string;
  category: string;
  phone: string;
  email: string;
  status: VendorStatus;
  notes: string;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md min-h-[600px]">
      <!-- View Toggler -->
      <div class="flex border-b mb-6">
        <button 
          (click)="view.set('my_vendors')" 
          class="py-2 px-4 font-semibold transition-colors duration-300"
          [class.text-pink-600]="view() === 'my_vendors'"
          [class.border-b-2]="view() === 'my_vendors'"
          [class.border-pink-600]="view() === 'my_vendors'"
          [class.text-gray-500]="view() !== 'my_vendors'"
        >My Vendors</button>
        <button 
          (click)="view.set('directory')" 
          class="py-2 px-4 font-semibold transition-colors duration-300"
          [class.text-pink-600]="view() === 'directory'"
          [class.border-b-2]="view() === 'directory'"
          [class.border-pink-600]="view() === 'directory'"
          [class.text-gray-500]="view() !== 'directory'"
        >Vendor Directory</button>
      </div>

      <!-- My Vendors View -->
      @if (view() === 'my_vendors') {
        <div>
          <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">My Vendors</h2>
          <!-- Add Vendor Form -->
          <details class="bg-gray-50 p-4 rounded-lg mb-6 border">
              <summary class="font-semibold cursor-pointer text-gray-700 hover:text-pink-600">Add New Vendor Manually</summary>
              <form (submit)="addVendor()" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input [(ngModel)]="newVendor.name" name="name" placeholder="Vendor Name" required class="p-2 border rounded-md">
                  <input [(ngModel)]="newVendor.category" name="category" placeholder="Category (e.g., Florist)" required class="p-2 border rounded-md">
                  <input [(ngModel)]="newVendor.phone" name="phone" placeholder="Phone Number" class="p-2 border rounded-md">
                  <input [(ngModel)]="newVendor.email" name="email" type="email" placeholder="Email Address" class="p-2 border rounded-md">
                  <select [(ngModel)]="newVendor.status" name="status" class="p-2 border rounded-md md:col-span-2">
                      <option>Researching</option>
                      <option>Contacted</option>
                      <option>Booked</option>
                      <option>Paid</option>
                  </select>
                   <!-- New Image Upload Section -->
                  <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Vendor Image (Optional)</label>
                      <div class="mt-1 flex items-center">
                          @if(newVendorImagePreview(); as previewUrl) {
                              <img [src]="previewUrl" alt="Vendor preview" class="h-16 w-16 object-cover rounded-md mr-4">
                          } @else {
                              <div class="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 mr-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                          }
                          <label for="newVendorImage" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                              <span>Upload file</span>
                          </label>
                          <input id="newVendorImage" name="newVendorImage" type="file" class="hidden" accept="image/png, image/jpeg, image/gif" (change)="onNewVendorImageUpload($event)">
                      </div>
                  </div>

                  <textarea [(ngModel)]="newVendor.notes" name="notes" placeholder="Notes (e.g., initial quote, contact person)" class="p-2 border rounded-md md:col-span-2" rows="3"></textarea>
                  <button type="submit" class="md:col-span-2 bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors">Add Vendor</button>
              </form>
          </details>
          
          <!-- Vendor Cards -->
          @if (myVendors().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for(vendor of myVendors(); track vendor.id) {
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
                  @if(vendor.imageUrl) {
                    <img [src]="vendor.imageUrl" [alt]="vendor.name" class="w-full h-40 object-cover rounded-t-lg">
                  } @else {
                    <div class="w-full h-40 bg-pink-50 flex items-center justify-center rounded-t-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                  }
                  <div class="p-5 flex flex-col justify-between flex-grow">
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
                    <div class="mt-4">
                      <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
                      <textarea 
                          [(ngModel)]="vendor.notes" 
                          (ngModelChange)="updateVendorNotes(vendor.id, $event)" 
                          placeholder="Add notes about communication, quotes, etc." 
                          class="w-full mt-1 p-2 text-sm border rounded-md bg-gray-50 h-24 text-gray-700 focus:ring-1 focus:ring-pink-400 focus:border-pink-400"
                          rows="4">
                      </textarea>
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
                </div>
              }
            </div>
          } @else {
              <p class="text-center text-gray-500 py-8">You haven't added any vendors. Find some in the Vendor Directory!</p>
          }
        </div>
      }
      
      <!-- Vendor Directory View -->
      @if (view() === 'directory') {
        <div>
          <h2 class="text-3xl font-bold font-serif text-gray-800 mb-2">Vendor Directory</h2>
          <p class="text-gray-500 mb-6">Find the perfect vendors for your special day.</p>
          
          <!-- Search and Filter -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <input 
              type="text" 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Search by name or location..." 
              class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
            >
          </div>
          <div class="flex flex-wrap gap-2 mb-8">
            @for(category of categories(); track category) {
              <button (click)="selectedCategory.set(category)" 
                class="px-4 py-2 text-sm font-medium rounded-full transition-colors"
                [class.bg-pink-600]="selectedCategory() === category"
                [class.text-white]="selectedCategory() === category"
                [class.bg-gray-200]="selectedCategory() !== category"
                [class.text-gray-700]="selectedCategory() !== category"
                [class.hover:bg-pink-200]="selectedCategory() !== category"
              >{{ category }}</button>
            }
          </div>

          <!-- Directory Vendor Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for(vendor of filteredVendors(); track vendor.id) {
              <div class="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white">
                <img [src]="vendor.imageUrl" [alt]="vendor.name" width="400" height="300" class="w-full h-48 object-cover">
                <div class="p-4 flex-grow flex flex-col">
                  <p class="text-xs font-semibold text-pink-600 uppercase">{{ vendor.category }}</p>
                  <h3 class="text-lg font-bold font-serif text-gray-800">{{ vendor.name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">{{ vendor.location }}</p>
                  <div class="flex items-center text-sm text-gray-600 mb-4">
                    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="ml-1 font-bold">{{ vendor.rating.toFixed(1) }}</span>
                    <span class="ml-2 text-gray-400">({{ vendor.reviews }} reviews)</span>
                  </div>
                  <div class="mt-auto">
                    <button (click)="addVendorFromDirectory(vendor)" 
                      [disabled]="isVendorInMyList().has(vendor.name)"
                      class="w-full text-center px-4 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      [class.bg-pink-600]="!isVendorInMyList().has(vendor.name)"
                      [class.text-white]="!isVendorInMyList().has(vendor.name)"
                      [class.hover:bg-pink-700]="!isVendorInMyList().has(vendor.name)"
                      [class.bg-green-600]="isVendorInMyList().has(vendor.name)"
                      [class.text-white]="isVendorInMyList().has(vendor.name)"
                    >
                      {{ isVendorInMyList().has(vendor.name) ? 'Added' : 'Add to My Vendors' }}
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-center text-gray-500 py-8 md:col-span-2 lg:col-span-3">No vendors found. Try adjusting your search.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorListComponent {
  private vendorService = inject(VendorService);
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private storageKey = computed(() => `wedding_my_vendors_${this.currentUser()}`);

  // View management
  view = signal<'my_vendors' | 'directory'>('my_vendors');

  // "My Vendors" state
  private nextId = 0;
  myVendors = signal<Vendor[]>([]);
  newVendor: Omit<Vendor, 'id'> = this.resetNewVendor();
  newVendorImagePreview = signal<string | null>(null);

  // "Vendor Directory" state
  allVendors = signal<DirectoryVendor[]>([]);
  searchTerm = signal('');
  selectedCategory = signal('All');

  categories = computed(() => {
    const vendors = this.allVendors();
    const uniqueCategories = [...new Set(vendors.map(v => v.category))].sort();
    return ['All', ...uniqueCategories];
  });

  filteredVendors = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    return this.allVendors().filter(vendor => {
      const matchesCategory = category === 'All' || vendor.category === category;
      const matchesSearch = vendor.name.toLowerCase().includes(term) || vendor.location.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });
  
  isVendorInMyList = computed(() => {
    const myVendorNames = this.myVendors().map(v => v.name);
    return new Set(myVendorNames);
  });
  
  constructor() {
    this.allVendors.set(this.vendorService.getVendors());
    
    effect(() => {
        this.myVendors.set(this.loadMyVendors());
        this.nextId = this.myVendors().reduce((max, vendor) => Math.max(max, vendor.id), -1) + 1;
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.currentUser()) {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.myVendors()));
      }
    });
  }
  
  private loadMyVendors(): Vendor[] {
    if (!this.currentUser()) return this.getDefaultMyVendors();
    
    const savedVendors = localStorage.getItem(this.storageKey());
    if(savedVendors) {
      try {
        return JSON.parse(savedVendors);
      } catch(e) {
        console.error('Error parsing my vendors from localStorage', e);
        return this.getDefaultMyVendors();
      }
    }
    return this.getDefaultMyVendors();
  }
  
  private getDefaultMyVendors(): Vendor[] {
    return [
      { id: 1, name: 'Evergreen Photography', category: 'Photography', phone: '555-1234', email: 'contact@evergreen.com', status: 'Booked', notes: 'Contract signed. 50% deposit paid.', imageUrl: 'https://picsum.photos/400/300?image=201' },
      { id: 2, name: 'The Grand Ballroom', category: 'Venue', phone: '555-5678', email: 'events@grandballroom.com', status: 'Paid', notes: 'Fully paid. Confirmed for 200 guests.', imageUrl: null },
      { id: 3, name: 'Blossom & Bloom', category: 'Florist', phone: '555-8765', email: 'info@blossom.com', status: 'Contacted', notes: 'Waiting for initial quote.', imageUrl: null },
    ];
  }

  addVendor() {
    if (!this.newVendor.name || !this.newVendor.category) return;
    this.myVendors.update(vendors => [...vendors, { ...this.newVendor, id: ++this.nextId }]);
    this.newVendor = this.resetNewVendor();
    this.newVendorImagePreview.set(null);
  }
  
  updateVendorStatus(id: number, status: VendorStatus) {
    this.myVendors.update(vendors =>
      vendors.map(vendor => (vendor.id === id ? { ...vendor, status } : vendor))
    );
  }

  updateVendorNotes(id: number, notes: string) {
    this.myVendors.update(vendors =>
      vendors.map(vendor => (vendor.id === id ? { ...vendor, notes } : vendor))
    );
  }

  removeVendor(id: number) {
    this.myVendors.update(vendors => vendors.filter(vendor => vendor.id !== id));
  }

  private resetNewVendor(): Omit<Vendor, 'id'> {
    return { name: '', category: '', phone: '', email: '', status: 'Researching' as const, notes: '', imageUrl: null };
  }
  
  addVendorFromDirectory(dirVendor: DirectoryVendor) {
    if (this.isVendorInMyList().has(dirVendor.name)) {
      return;
    }
    this.myVendors.update(vendors => [
      ...vendors, 
      { 
        id: ++this.nextId,
        name: dirVendor.name,
        category: dirVendor.category,
        phone: dirVendor.phone,
        email: dirVendor.email,
        status: 'Researching',
        notes: '',
        imageUrl: dirVendor.imageUrl,
      }
    ]);
    this.view.set('my_vendors');
  }

  onNewVendorImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newVendor.imageUrl = e.target.result;
        this.newVendorImagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
      input.value = ''; // Reset input to allow re-uploading the same file
    }
  }
}
