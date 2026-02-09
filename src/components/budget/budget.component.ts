import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';

interface BudgetItem {
  id: number;
  category: string;
  estimated: number;
  actual: number;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-6">Budget Tracker</h2>
      
      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 bg-blue-100 rounded-lg text-center">
          <p class="text-sm text-blue-600">Total Estimated</p>
          <p class="text-2xl font-bold text-blue-800">{{ totalEstimated() | currency }}</p>
        </div>
        <div class="p-4 bg-green-100 rounded-lg text-center">
          <p class="text-sm text-green-600">Total Spent</p>
          <p class="text-2xl font-bold text-green-800">{{ totalActual() | currency }}</p>
        </div>
        <div class="p-4 rounded-lg text-center" [ngClass]="remainingBudget() >= 0 ? 'bg-purple-100' : 'bg-red-100'">
          <p class="text-sm" [ngClass]="remainingBudget() >= 0 ? 'text-purple-600' : 'text-red-600'">Remaining</p>
          <p class="text-2xl font-bold" [ngClass]="remainingBudget() >= 0 ? 'text-purple-800' : 'text-red-800'">
            {{ remainingBudget() | currency }}
          </p>
        </div>
      </div>

      <!-- Add Item Form -->
      <details class="bg-gray-50 p-4 rounded-lg mb-6 border">
        <summary class="font-semibold cursor-pointer text-gray-700 hover:text-pink-600">Add Expense Item</summary>
        <form (submit)="addItem()" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1">Category</label>
            <input [(ngModel)]="newItem.category" name="category" placeholder="e.g., Venue" required class="p-2 border rounded-md">
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1">Estimated Cost</label>
            <input [(ngModel)]="newItem.estimated" name="estimated" type="number" placeholder="10000" required class="p-2 border rounded-md">
          </div>
          <button type="submit" class="bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors h-10">Add Item</button>
        </form>
      </details>

      <!-- Budget Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left py-3 px-4 font-semibold text-sm">Category</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Estimated</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Actual</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Difference</th>
              <th class="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for(item of items(); track item.id) {
              <tr class="border-b border-gray-200">
                <td class="py-3 px-4">{{ item.category }}</td>
                <td class="py-3 px-4">{{ item.estimated | currency }}</td>
                <td class="py-3 px-4">
                  <input type="number" [(ngModel)]="item.actual" (ngModelChange)="updateItem(item)" class="w-28 p-1 border rounded-md">
                </td>
                <td class="py-3 px-4" [ngClass]="item.estimated - item.actual >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ (item.estimated - item.actual) | currency }}
                </td>
                 <td class="py-3 px-4">
                  <button (click)="removeItem(item.id)" class="text-gray-400 hover:text-red-600 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetComponent {
  private nextId = 4;
  items = signal<BudgetItem[]>([
    { id: 1, category: 'Venue', estimated: 10000, actual: 12000 },
    { id: 2, category: 'Catering', estimated: 8000, actual: 7500 },
    { id: 3, category: 'Photography', estimated: 3000, actual: 3000 },
    { id: 4, category: 'Dress & Attire', estimated: 2500, actual: 0 },
  ]);

  newItem = { category: '', estimated: 0, actual: 0 };

  totalEstimated = computed(() => this.items().reduce((sum, item) => sum + item.estimated, 0));
  totalActual = computed(() => this.items().reduce((sum, item) => sum + item.actual, 0));
  remainingBudget = computed(() => this.totalEstimated() - this.totalActual());

  addItem() {
    if (!this.newItem.category || this.newItem.estimated <= 0) return;
    this.items.update(items => [
      ...items,
      { ...this.newItem, id: ++this.nextId }
    ]);
    this.newItem = { category: '', estimated: 0, actual: 0 };
  }

  updateItem(updatedItem: BudgetItem) {
    this.items.update(items =>
      items.map(item => (item.id === updatedItem.id ? { ...item, actual: Number(updatedItem.actual) } : item))
    );
  }
  
  removeItem(id: number) {
     this.items.update(items => items.filter(item => item.id !== id));
  }
}
