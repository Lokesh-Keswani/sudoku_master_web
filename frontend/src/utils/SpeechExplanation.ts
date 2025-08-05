import { SolutionStep, SpeechOptions } from '../types/solutionReport';
import { getTechniqueById } from '../data/enhancedTechniques';

export class SpeechExplanation {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private options: SpeechOptions;
  private isPlaying: boolean = false;
  private currentStepIndex: number = 0;
  private steps: SolutionStep[] = [];
  private onStepChange?: (stepIndex: number) => void;
  private onComplete?: () => void;

  constructor(options: Partial<SpeechOptions> = {}) {
    this.synthesis = window.speechSynthesis;
    this.options = {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      language: 'en-US',
      ...options
    };
  }

  public setSteps(steps: SolutionStep[]): void {
    this.steps = steps;
    this.currentStepIndex = 0;
  }

  public setCallbacks(
    onStepChange?: (stepIndex: number) => void,
    onComplete?: () => void
  ): void {
    this.onStepChange = onStepChange;
    this.onComplete = onComplete;
  }

  public async playStep(stepIndex: number): Promise<void> {
    if (!this.options.enabled || stepIndex >= this.steps.length) {
      return;
    }

    this.stop();
    this.currentStepIndex = stepIndex;
    const step = this.steps[stepIndex];
    
    const text = this.generateStepText(step, stepIndex + 1);
    await this.speak(text);
  }

  public async playAllSteps(): Promise<void> {
    if (!this.options.enabled || this.steps.length === 0) {
      return;
    }

    this.stop();
    this.isPlaying = true;
    this.currentStepIndex = 0;

    for (let i = 0; i < this.steps.length && this.isPlaying; i++) {
      this.currentStepIndex = i;
      this.onStepChange?.(i);
      
      const step = this.steps[i];
      const text = this.generateStepText(step, i + 1);
      
      await this.speak(text);
      
      // Small pause between steps
      if (i < this.steps.length - 1 && this.isPlaying) {
        await this.delay(1000);
      }
    }

    this.isPlaying = false;
    this.onComplete?.();
  }

  public async playFromCurrentStep(): Promise<void> {
    if (!this.options.enabled || this.currentStepIndex >= this.steps.length) {
      return;
    }

    this.isPlaying = true;

    for (let i = this.currentStepIndex; i < this.steps.length && this.isPlaying; i++) {
      this.currentStepIndex = i;
      this.onStepChange?.(i);
      
      const step = this.steps[i];
      const text = this.generateStepText(step, i + 1);
      
      await this.speak(text);
      
      // Small pause between steps
      if (i < this.steps.length - 1 && this.isPlaying) {
        await this.delay(1000);
      }
    }

    this.isPlaying = false;
    this.onComplete?.();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.utterance) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.utterance) {
      this.synthesis.resume();
      this.playFromCurrentStep();
    }
  }

  public stop(): void {
    this.isPlaying = false;
    this.synthesis.cancel();
    this.utterance = null;
  }

  public skipToStep(stepIndex: number): void {
    this.stop();
    this.currentStepIndex = stepIndex;
    this.onStepChange?.(stepIndex);
  }

  public setOptions(options: Partial<SpeechOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  private async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.options.enabled) {
        resolve();
        return;
      }

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = this.options.rate;
      this.utterance.pitch = this.options.pitch;
      this.utterance.lang = this.options.language;
      
      if (this.options.voice) {
        this.utterance.voice = this.options.voice;
      }

      this.utterance.onend = () => {
        this.utterance = null;
        resolve();
      };

      this.utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.utterance = null;
        reject(new Error('Speech synthesis failed'));
      };

      this.synthesis.speak(this.utterance);
    });
  }

  private generateStepText(step: SolutionStep, stepNumber: number): string {
    const technique = getTechniqueById(step.techniqueId);
    const techniqueName = technique?.name || step.technique;
    
    let text = `Step ${stepNumber}. `;
    text += `Using ${techniqueName} technique, `;
    text += `place the number ${step.value} in row ${step.row + 1}, column ${step.col + 1}. `;
    
    if (technique?.fullDescription) {
      text += technique.fullDescription;
    } else {
      text += step.explanation;
    }

    return text;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const createSpeechExplanation = (options: Partial<SpeechOptions> = {}): SpeechExplanation => {
  return new SpeechExplanation(options);
};

export const getDefaultVoices = (): SpeechSynthesisVoice[] => {
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => 
    voice.lang.startsWith('en') && 
    (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Premium'))
  );
};

export const getVoiceByName = (name: string): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(voice => voice.name === name);
};

export const getVoiceByLang = (lang: string): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(voice => voice.lang.startsWith(lang));
};

// Initialize voices when the page loads
if (typeof window !== 'undefined') {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices are now available
    console.log('Speech synthesis voices loaded:', window.speechSynthesis.getVoices().length);
  };
} 