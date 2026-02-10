import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserSettings {
  autoRefresh: boolean;
  refreshSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private storageKey = 'secure_api_monitor_settings';

  // default values (used first time user visits app)
  private defaultSettings: UserSettings = {
    autoRefresh: true,
    refreshSeconds: 10,
  };

  private settingsSubject = new BehaviorSubject<UserSettings>(this.load());
  settings$ = this.settingsSubject.asObservable();

  // Get current value instantly
  get current(): UserSettings {
    return this.settingsSubject.value;
  }

  update(settings: UserSettings) {
    localStorage.setItem(this.storageKey, JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }

  private load(): UserSettings {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return this.defaultSettings;

    try {
      return JSON.parse(raw);
    } catch {
      return this.defaultSettings;
    }
  }
}
