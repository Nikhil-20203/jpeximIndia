import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { State } from './state';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './app.html',
})
export class App {
  private http = inject(HttpClient);
  private state = inject(State);

  // Bind properties to our shared State service
  mobileMenuOpen = this.state.mobileMenuOpen;
  chatOpen = this.state.chatOpen;

  // B2B Chat Assistant State
  chatLoading = signal<boolean>(false);
  chatInputText = signal<string>('');
  chatMessages = signal<ChatMessage[]>([
    {
      role: 'model',
      text: `Hello! I am your **JP EXIM** virtual trade representative.\n\nWe specialize in bulk exports of premium **Fresh Potatoes** and **Superior Peanuts** from Gujarat, India. I can answer questions about specifications, packing, transport logistics, and regulatory approvals. How can I help you today?`
    }
  ]);

  // Frequently Asked Questions / Suggestion Chips for Chat
  suggestionChips = [
    'What are the available potato size ranges?',
    'What is the moisture and admixture of peanuts?',
    'What payment terms do you accept?',
    'What trade documents do you provide?'
  ];

  toggleMobileMenu() {
    this.state.toggleMobileMenu();
  }

  closeMobileMenu() {
    this.state.setMobileMenuOpen(false);
  }

  toggleChat() {
    this.state.toggleChat();
  }

  sendChatMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || this.chatLoading()) return;

    // Append user message
    const currentMsgs = this.chatMessages();
    this.chatMessages.set([...currentMsgs, { role: 'user', text: trimmed }]);
    this.chatInputText.set('');
    this.chatLoading.set(true);

    const payload = {
      message: trimmed,
      history: this.chatMessages().slice(0, -1) // Excluding the latest message
    };

    this.http.post<{ text: string }>('/api/chat', payload)
      .subscribe({
        next: (res) => {
          this.chatLoading.set(false);
          this.chatMessages.update(msgs => [...msgs, { role: 'model', text: res.text }]);
          this.scrollToChatBottom();
        },
        error: (err) => {
          console.error('Chat Assistant Error:', err);
          this.chatLoading.set(false);
          this.chatMessages.update(msgs => [
            ...msgs,
            {
              role: 'model',
              text: `I apologize for any connectivity issue. I am fully trained on Mr. Padhiyar's export criteria at Deesa, Gujarat. To get an official shipping quote immediately, please submit our **Lead Inquiry Form** on our Contact Us page or reach us directly on WhatsApp (+91 7046058487).`
            }
          ]);
          this.scrollToChatBottom();
        }
      });
  }

  useSuggestion(chip: string) {
    this.sendChatMessage(chip);
  }

  clearChat() {
    this.chatMessages.set([
      {
        role: 'model',
        text: `Hello! I am your **JP EXIM** virtual trade representative.\n\nWe specialize in bulk exports of premium **Fresh Potatoes** and **Superior Peanuts** from Gujarat, India. I can answer questions about specifications, packing, transport logistics, and regulatory approvals. How can I help you today?`
      }
    ]);
  }

  formatMessageText(text: string): string {
    if (!text) return '';
    
    let sanitized = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert markdown bold **text** to custom blue bold tags
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#0A2540]">$1</strong>');

    // Convert bullet points starting with * or - to custom gold-bullet styled rows
    const lines = sanitized.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        return `<div class="flex items-start gap-1.5 my-1 pl-1"><span class="text-[#D4AF37] font-bold">•</span><span>${content}</span></div>`;
      }
      return line;
    });

    return processedLines.join('\n');
  }

  scrollToChatBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-message-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
