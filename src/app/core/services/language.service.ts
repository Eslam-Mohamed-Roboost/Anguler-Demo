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

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'en' || saved === 'ar') {
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

  translate(key: TranslationKey): string {
    return TRANSLATIONS[this._lang()][key];
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
  }

  toggleLang(): void {
    this.setLang(this._lang() === 'en' ? 'ar' : 'en');
  }
}
