import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">Dashboard</h2>

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
        
        <!-- Welcome & Image -->
        <div class="bg-cover bg-center rounded-lg shadow-md h-64 md:h-auto" style="background-image: url('https://picsum.photos/800/600?image=1062')">
          <div class="bg-black bg-opacity-40 p-6 rounded-lg h-full flex flex-col justify-end">
            <h3 class="text-2xl font-semibold font-serif text-white">Plan Your Forever</h3>
            <p class="text-pink-100 mt-2">Let's make your dream wedding a reality, one detail at a time.</p>
          </div>
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
export class DashboardComponent {
  weddingDate = signal<string>(this.getInitialDate());
  countdown = signal<any>(null);
  private timer: any;

  constructor() {
    effect(() => {
      this.startCountdown(this.weddingDate());
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getInitialDate(): string {
      const storedDate = localStorage.getItem('weddingDate');
      if (storedDate) {
        return storedDate;
      }
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      return futureDate.toISOString().split('T')[0];
  }

  updateWeddingDate(date: string) {
    localStorage.setItem('weddingDate', date);
    this.weddingDate.set(date);
  }

  startCountdown(dateString: string) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const countdownDate = new Date(dateString).getTime();
    if(isNaN(countdownDate)) return;

    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      if (distance < 0) {
        clearInterval(this.timer);
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
}
