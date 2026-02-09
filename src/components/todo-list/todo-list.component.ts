import { ChangeDetectionStrategy, Component, computed, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-2">Wedding Checklist</h2>
      <p class="text-gray-500 mb-6">Stay organized and on track with your planning.</p>

      <!-- Add Task Form -->
      <form (submit)="addTask()" class="flex items-center space-x-2 mb-6">
        <input 
          type="text" 
          [(ngModel)]="newTaskText" 
          name="newTaskText" 
          placeholder="e.g., Book photographer"
          class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
        >
        <button type="submit" class="bg-pink-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors duration-300 shadow">Add</button>
      </form>

      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between mb-1">
          <span class="text-base font-medium text-pink-700">Progress</span>
          <span class="text-sm font-medium text-pink-700">{{ progress() }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-pink-500 h-2.5 rounded-full" [style.width]="progress() + '%'"></div>
        </div>
      </div>
      
      <!-- Task List -->
      <ul class="space-y-3">
        @for(task of tasks(); track task.id) {
          <li 
            class="flex items-center p-4 rounded-lg transition-colors duration-200"
            [class.bg-green-50]="task.completed"
            [class.bg-gray-50]="!task.completed"
          >
            <input 
              type="checkbox" 
              [checked]="task.completed"
              (change)="toggleTask(task.id)"
              class="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
            >
            <span 
              class="ml-4 flex-grow text-gray-700"
              [class.line-through]="task.completed"
              [class.text-gray-400]="task.completed"
            >{{ task.text }}</span>
            <button (click)="removeTask(task.id)" class="text-gray-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        } @empty {
          <p class="text-center text-gray-500 py-8">Your to-do list is empty. Add a task to get started!</p>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private storageKey = computed(() => `wedding_tasks_${this.currentUser()}`);
  
  newTaskText = '';
  private nextId = 0;
  tasks = signal<Task[]>([]);

  progress = computed(() => {
    const taskList = this.tasks();
    if (taskList.length === 0) return 0;
    const completedCount = taskList.filter(t => t.completed).length;
    return Math.round((completedCount / taskList.length) * 100);
  });
  
  constructor() {
    effect(() => {
      this.tasks.set(this.loadTasks());
      this.nextId = this.tasks().reduce((max, task) => Math.max(max, task.id), -1) + 1;
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.currentUser()) {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.tasks()));
      }
    });
  }

  private loadTasks(): Task[] {
    if (!this.currentUser()) return this.getDefaultTasks();

    const savedTasks = localStorage.getItem(this.storageKey());
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error('Error parsing tasks from localStorage', e);
        return this.getDefaultTasks();
      }
    }
    return this.getDefaultTasks();
  }
  
  private getDefaultTasks(): Task[] {
      const initialTasks = [
        { text: 'Set a budget', completed: true },
        { text: 'Create guest list', completed: true },
        { text: 'Book a venue', completed: false },
        { text: 'Hire a photographer', completed: false },
        { text: 'Send save-the-dates', completed: false },
        { text: 'Book caterer', completed: false },
        { text: 'Buy wedding rings', completed: false },
      ];
      return initialTasks.map((task, index) => ({...task, id: index}));
  }

  addTask() {
    if (this.newTaskText.trim() === '') return;
    this.tasks.update(tasks => [
      ...tasks,
      { id: this.nextId++, text: this.newTaskText.trim(), completed: false }
    ]);
    this.newTaskText = '';
  }

  toggleTask(id: number) {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  removeTask(id: number) {
    this.tasks.update(tasks => tasks.filter(task => task.id !== id));
  }
}
