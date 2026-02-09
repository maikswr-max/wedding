// FIX: Import 'computed' from '@angular/core' to resolve 'Cannot find name 'computed'' error.
import { ChangeDetectionStrategy, Component, signal, effect, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface MoodBoardImage {
  id: number;
  url: string;
  caption: string;
}

@Component({
  selector: 'app-mood-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-2">Wedding Mood Board</h2>
      <p class="text-gray-500 mb-6">Collect inspiration for your perfect day.</p>

      <details class="bg-gray-50 p-4 rounded-lg mb-6 border">
        <summary class="font-semibold cursor-pointer text-gray-700 hover:text-pink-600">Add Inspiration</summary>
        <form (submit)="addImage()" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div class="flex flex-col md:col-span-2">
            <label class="text-sm font-medium text-gray-600 mb-1">Image URL</label>
            <input [(ngModel)]="newImage.url" name="url" placeholder="https://example.com/image.jpg" required class="p-2 border rounded-md">
          </div>
          <button type="submit" class="bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors h-10">Add Image</button>
        </form>
      </details>

      @if(images().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for(image of images(); track image.id) {
            <div class="relative group overflow-hidden rounded-lg shadow-lg">
              <img [src]="image.url" alt="Mood board image" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                <button (click)="removeImage(image.id)" class="absolute top-2 right-2 text-white bg-red-600/70 hover:bg-red-600 rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No images yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding an image URL.</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodBoardComponent {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private storageKey = computed(() => `wedding_moodboard_images_${this.currentUser()}`);
  
  private nextId = 0;
  images = signal<MoodBoardImage[]>([]);
  newImage = { url: '' };
  
  constructor() {
    effect(() => {
        this.images.set(this.loadImages());
        this.nextId = this.images().reduce((max, img) => Math.max(max, img.id), -1) + 1;
    }, { allowSignalWrites: true });
    
    effect(() => {
      if(this.currentUser()) {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.images()));
      }
    });
  }
  
  private loadImages(): MoodBoardImage[] {
    if (!this.currentUser()) return this.getDefaultImages();

    const savedImages = localStorage.getItem(this.storageKey());
    if(savedImages) {
      try {
        return JSON.parse(savedImages);
      } catch(e) {
        console.error('Error parsing mood board images from localStorage', e);
        return this.getDefaultImages();
      }
    }
    return this.getDefaultImages();
  }
  
  private getDefaultImages(): MoodBoardImage[] {
    return [
      { id: 1, url: 'https://picsum.photos/id/10/400/600', caption: 'Wedding dress idea' },
      { id: 2, url: 'https://picsum.photos/id/225/400/600', caption: 'Venue decor' },
      { id: 3, url: 'https://picsum.photos/id/1040/400/600', caption: 'Flower arrangements' },
      { id: 4, url: 'https://picsum.photos/id/106/400/600', caption: 'Cake design' },
    ];
  }

  addImage() {
    if (this.newImage.url.trim() === '') return;
    try {
      new URL(this.newImage.url);
    } catch (_) {
      return;
    }

    this.images.update(images => [
      ...images,
      { id: ++this.nextId, url: this.newImage.url.trim(), caption: '' }
    ]);
    this.newImage.url = '';
  }
  
  removeImage(id: number) {
    this.images.update(images => images.filter(image => image.id !== id));
  }
}