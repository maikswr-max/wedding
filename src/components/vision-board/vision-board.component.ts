// FIX: Import 'computed' from '@angular/core' to resolve 'Cannot find name 'computed'' error.
import { ChangeDetectionStrategy, Component, signal, effect, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoogleGenAI, Type } from '@google/genai';
import { AuthService } from '../../services/auth.service';

interface Color {
  name: string;
  hex: string;
}

interface WeddingTheme {
  themeName: string;
  description: string;
  colorPalette: Color[];
}

@Component({
  selector: 'app-vision-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold font-serif text-gray-800 mb-2">AI Vision Board</h2>
      <p class="text-gray-500 mb-6">Let our AI assistant help you brainstorm the perfect wedding theme.</p>
      
      <!-- Prompt Form -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6 border">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div class="flex flex-col md:col-span-2">
              <label for="prompt" class="text-sm font-medium text-gray-600 mb-1">Describe your dream wedding vibe</label>
              <input 
                id="prompt"
                [(ngModel)]="prompt" 
                name="prompt" 
                placeholder="e.g., A cozy, rustic wedding in a barn during autumn"
                class="p-2 border rounded-md"
                (keyup.enter)="generateIdeas()"
                [disabled]="loading()"
              >
            </div>
            <button 
              (click)="generateIdeas()" 
              [disabled]="loading() || !prompt"
              class="bg-pink-600 text-white font-semibold p-2 rounded-md hover:bg-pink-700 transition-colors h-10 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              @if(loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              } @else {
                 <span>Generate Ideas</span>
              }
            </button>
        </div>
        @if(error()) {
          <p class="text-red-600 text-sm mt-2">{{ error() }}</p>
        }
      </div>

      <!-- Results -->
      @if(themes().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for(theme of themes(); track theme.themeName) {
            <div class="border rounded-lg shadow-sm flex flex-col bg-white overflow-hidden">
                <div class="p-5">
                    <h3 class="text-xl font-bold font-serif text-gray-800 mb-2">{{ theme.themeName }}</h3>
                    <p class="text-sm text-gray-600 mb-4 h-24 overflow-y-auto">{{ theme.description }}</p>
                </div>
                <div class="bg-gray-50 p-4 mt-auto">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Color Palette</h4>
                    <div class="flex flex-wrap gap-2">
                        @for(color of theme.colorPalette; track color.hex) {
                            <div class="flex items-center">
                                <div class="w-5 h-5 rounded-full mr-2 border" [style.background-color]="color.hex"></div>
                                <span class="text-xs text-gray-600">{{ color.name }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
          }
        </div>
      } @else if(!loading()) {
         <div class="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Let's find your vision</h3>
          <p class="mt-1 text-sm text-gray-500">Enter a description above and let AI create some themes for you.</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisionBoardComponent {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private storageKey = computed(() => `wedding_vision_themes_${this.currentUser()}`);

  private ai: GoogleGenAI;
  prompt = '';
  themes = signal<WeddingTheme[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    effect(() => {
        this.themes.set(this.loadThemes());
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.currentUser()) {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.themes()));
      }
    });
  }

  private loadThemes(): WeddingTheme[] {
    if (!this.currentUser()) return [];
    
    const savedThemes = localStorage.getItem(this.storageKey());
    if (savedThemes) {
      try {
        return JSON.parse(savedThemes);
      } catch (e) {
        console.error('Error parsing themes from localStorage', e);
        return [];
      }
    }
    return [];
  }

  async generateIdeas() {
    if (!this.prompt || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.themes.set([]); // Clear previous results

    const fullPrompt = `Generate 3 distinct wedding theme ideas based on the following user description: "${this.prompt}". For each theme, provide a theme name, a short compelling description, and a color palette of 4-5 colors with their common names and hex codes.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    themeName: { type: Type.STRING, description: 'The creative name of the wedding theme.' },
                    description: { type: Type.STRING, description: 'A short, engaging description of the theme.' },
                    colorPalette: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING, description: 'The common name of the color (e.g., "Dusty Rose").' },
                          hex: { type: Type.STRING, description: 'The hex code for the color (e.g., "#D8A7B1").' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      const jsonStr = response.text.trim();
      const result = JSON.parse(jsonStr);

      if (result && result.themes) {
        this.themes.set(result.themes);
      } else {
        throw new Error('Unexpected API response format.');
      }

    } catch (e) {
      console.error('Error generating wedding themes:', e);
      this.error.set('Sorry, something went wrong while generating ideas. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}