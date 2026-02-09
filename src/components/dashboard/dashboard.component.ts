import { ChangeDetectionStrategy, Component, computed, effect, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">Home</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Countdown Timer -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-pink-100">
          <h3 class="text-xl font-semibold font-serif mb-4 text-pink-800">Countdown to the Big Day</h3>
          <div class="flex items-center space-x-4 mb-4">
            <label for="weddingDate" class="text-gray-600">Wedding Date:</label>
            <input
              type="date"
              id="weddingDate"
              [ngModel]="weddingDate()"
              (ngModelChange)="updateWeddingDate($event)"
              class="p-2 border rounded-md focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          @if(countdown(); as cd) {
            @if(cd.total > 0) {
            <div class="grid grid-cols-4 gap-4 text-center">
                <div class="p-4 bg-pink-50 rounded-lg">
                    <span class="text-4xl font-bold text-pink-600">{{ cd.days }}</span>
                    <span class="block text-sm text-gray-500">Days</span>
                </div>
                <div class="p-4 bg-pink-50 rounded-lg">
                    <span class="text-4xl font-bold text-pink-600">{{ cd.hours }}</span>
                    <span class="block text-sm text-gray-500">Hours</span>
                </div>
                <div class="p-4 bg-pink-50 rounded-lg">
                    <span class="text-4xl font-bold text-pink-600">{{ cd.minutes }}</span>
                    <span class="block text-sm text-gray-500">Minutes</span>
                </div>
                <div class="p-4 bg-pink-50 rounded-lg">
                    <span class="text-4xl font-bold text-pink-600">{{ cd.seconds }}</span>
                    <span class="block text-sm text-gray-500">Seconds</span>
                </div>
            </div>
            } @else {
              <div class="text-center p-8 bg-green-50 rounded-lg">
                <h4 class="text-2xl font-bold text-green-700">Congratulations!</h4>
                <p class="text-gray-600 mt-2">Wishing you a lifetime of love and happiness.</p>
              </div>
            }
          } @else {
             <p class="text-gray-500">Please select your wedding date to start the countdown.</p>
          }
        </div>
        
        <!-- Welcome & Image Slideshow -->
        <div class="relative group bg-cover bg-center rounded-lg shadow-md h-64 md:h-auto" [style.background-image]="'url(' + displayImageUrl() + ')'">
            <!-- Dark overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>

            <!-- All content is absolutely positioned or in a flex container to manage layout -->
            <div class="relative p-6 h-full flex flex-col justify-between">
                <!-- Empty div to push content down -->
                <div>
                    <!-- Top controls will live here absolutely positioned -->
                    <div class="absolute top-0 right-0 p-0 m-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <!-- Upload Button -->
                        <label 
                            for="imageUpload" 
                            title="Add image (up to 5)"
                            [class]="'bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full ' + (customImageUrls().length >= 5 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                        </label>
                        <!-- Remove Button -->
                        @if(customImageUrls().length > 0) {
                        <button (click)="removeCurrentImage()" class="bg-white/80 hover:bg-white text-red-600 p-2 rounded-full" title="Remove current image">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>
                        </button>
                        }
                    </div>
                </div>

                <!-- Centered content like arrows -->
                <div>
                    @if(customImageUrls().length > 1) {
                    <button (click)="previousImage()" class="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button (click)="nextImage()" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    }
                </div>

                <!-- Bottom content -->
                <div>
                    <!-- Text Content -->
                    <div>
                        <h3 class="text-2xl font-semibold font-serif text-white">Plan Your Forever</h3>
                        <p class="text-pink-100 mt-2">Let's make your dream wedding a reality, one detail at a time.</p>
                    </div>
                    <!-- Dot Indicators -->
                    @if(customImageUrls().length > 1) {
                        <div class="flex justify-center space-x-2 pt-4">
                            @for(url of customImageUrls(); track $index) {
                            <button 
                                (click)="goToImage($index)"
                                [attr.aria-label]="'Go to image ' + ($index + 1)"
                                class="h-2 w-2 rounded-full transition-colors"
                                [class]="activeImageIndex() === $index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'">
                            </button>
                            }
                        </div>
                    }
                </div>
            </div>
            
            <input 
                type="file" 
                id="imageUpload" 
                class="hidden" 
                accept="image/png, image/jpeg, image/gif" 
                (change)="onImageUpload($event)"
                [disabled]="customImageUrls().length >= 5"
            >
        </div>

      </div>

      <!-- Quick Stats -->
       <div class="mt-8">
        <h3 class="text-2xl font-semibold font-serif text-gray-800 mb-4">At a Glance</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <p class="text-3xl font-bold text-pink-600">125</p>
            <p class="text-gray-500 mt-1">Guests Invited</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <p class="text-3xl font-bold text-blue-600">8</p>
            <p class="text-gray-500 mt-1">Vendors Booked</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <p class="text-3xl font-bold text-green-600">15 / 50</p>
            <p class="text-gray-500 mt-1">Tasks Completed</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <p class="text-3xl font-bold text-yellow-600">$15,000</p>
            <p class="text-gray-500 mt-1">Budget Remaining</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnDestroy {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;

  private weddingDateStorageKey = computed(() => `wedding_date_${this.currentUser()}`);
  private dashboardImagesStorageKey = computed(() => `dashboard_images_${this.currentUser()}`);

  weddingDate = signal<string>('');
  countdown = signal<any>(null);
  private countdownTimer: any;
  
  customImageUrls = signal<string[]>([]);
  activeImageIndex = signal(0);
  private slideshowTimer: any;

  displayImageUrl = computed(() => {
    const urls = this.customImageUrls();
    if (urls.length > 0) {
      const index = Math.max(0, Math.min(this.activeImageIndex(), urls.length - 1));
      return urls[index];
    }
    return 'https://picsum.photos/id/1029/800/600';
  });

  constructor() {
    effect(() => {
      this.loadData();
      this.setupSlideshow();
    }, { allowSignalWrites: true });
    
    effect(() => {
      this.startCountdown(this.weddingDate());
    });
  }

  loadData() {
    this.weddingDate.set(this.getInitialDate());
    const savedImagesJson = this.currentUser() ? localStorage.getItem(this.dashboardImagesStorageKey()) : null;
    if (savedImagesJson) {
      try {
        const savedImages = JSON.parse(savedImagesJson);
        if (Array.isArray(savedImages)) {
          this.customImageUrls.set(savedImages);
        }
      } catch (e) {
        console.error('Could not parse dashboard images from local storage', e);
        this.customImageUrls.set([]);
      }
    } else {
      this.customImageUrls.set([]);
    }
    this.activeImageIndex.set(0);
  }

  ngOnDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
    }
  }

  getInitialDate(): string {
      if (!this.currentUser()) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        return futureDate.toISOString().split('T')[0];
      }
      const storedDate = localStorage.getItem(this.weddingDateStorageKey());
      if (storedDate) {
        return storedDate;
      }
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      return futureDate.toISOString().split('T')[0];
  }

  updateWeddingDate(date: string) {
    if (this.currentUser()) {
      localStorage.setItem(this.weddingDateStorageKey(), date);
    }
    this.weddingDate.set(date);
  }

  startCountdown(dateString: string) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    if (!dateString) return;
    const countdownDate = new Date(dateString).getTime();
    if(isNaN(countdownDate)) return;

    this.countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        clearInterval(this.countdownTimer);
        this.countdown.set({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdown.set({ total: distance, days, hours, minutes, seconds });
    }, 1000);
  }

  // --- Slideshow Logic ---
  setupSlideshow() {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
    }
    if (this.customImageUrls().length > 1) {
      this.slideshowTimer = setInterval(() => {
        this.nextImage(false); // don't reset timer from inside the timer
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  resetSlideshowTimer() {
    this.setupSlideshow();
  }

  nextImage(resetTimer = true) {
    const urls = this.customImageUrls();
    if (urls.length > 1) {
      this.activeImageIndex.update(index => (index + 1) % urls.length);
      if (resetTimer) this.resetSlideshowTimer();
    }
  }

  previousImage() {
    const urls = this.customImageUrls();
    if (urls.length > 1) {
      this.activeImageIndex.update(index => (index - 1 + urls.length) % urls.length);
      this.resetSlideshowTimer();
    }
  }

  goToImage(index: number) {
    this.activeImageIndex.set(index);
    this.resetSlideshowTimer();
  }

  onImageUpload(event: Event) {
    if (this.customImageUrls().length >= 5) {
      return;
    }
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        this.customImageUrls.update(urls => [...urls, imageUrl]);
        this.activeImageIndex.set(this.customImageUrls().length - 1);
        this.saveImages();
        this.resetSlideshowTimer();
      };
      reader.readAsDataURL(file);
    }
  }

  removeCurrentImage() {
    const urls = this.customImageUrls();
    if (urls.length === 0) return;

    const indexToRemove = this.activeImageIndex();
    this.customImageUrls.update(urls => urls.filter((_, i) => i !== indexToRemove));

    if (this.activeImageIndex() >= this.customImageUrls().length) {
      this.activeImageIndex.set(Math.max(0, this.customImageUrls().length - 1));
    }

    this.saveImages();
    this.resetSlideshowTimer();
  }

  private saveImages() {
    if (this.currentUser()) {
      localStorage.setItem(this.dashboardImagesStorageKey(), JSON.stringify(this.customImageUrls()));
    }
  }
}
