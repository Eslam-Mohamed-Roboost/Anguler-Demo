import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Lang, TRANSLATIONS, TranslationKey } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  private readonly _lang = signal<Lang>('en');
  readonly lang = this._lang.asReadonly();
  private readonly _refreshVersion = signal(0);
  readonly refreshVersion = this._refreshVersion.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'en' || saved === 'ar' || saved === 'de') {
        this._lang.set(saved);
      }
    }

    effect(() => {
      const lang = this._lang();
      if (isPlatformBrowser(this.platformId)) {
        const html = this.doc.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('lang', lang);
      }
    });
  }

  translate(key: TranslationKey | string): string {
    const translations = TRANSLATIONS[this._lang()] as Record<string, string>;
    return translations[key] ?? key;
  }

  setLang(lang: Lang): void {
    if (this._lang() === lang) return;

    this._lang.set(lang);
    this._refreshVersion.update((version) => version + 1);
  }

  toggleLang(): void {
    const current = this._lang();
    if (current === 'en') this.setLang('ar');
    else if (current === 'ar') this.setLang('de');
    else this.setLang('en');
  }
}
