import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class State {
  chatOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  toggleChat() {
    this.chatOpen.update(v => !v);
  }

  setChatOpen(open: boolean) {
    this.chatOpen.set(open);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  setMobileMenuOpen(open: boolean) {
    this.mobileMenuOpen.set(open);
  }
}
