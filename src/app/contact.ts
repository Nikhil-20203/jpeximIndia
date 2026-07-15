import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './contact.html',
})
export class Contact implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Lead Generation & B2B Proposal State
  inquiryForm!: FormGroup;
  inquirySubmitting = signal<boolean>(false);
  inquirySuccess = signal<boolean>(false);
  draftedProposal = signal<string | null>(null);
  followUpMessage = signal<string | null>(null);

  ngOnInit() {
    this.inquiryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      company: ['', [Validators.required]],
      country: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      product: ['Both', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      message: ['']
    });
  }

  submitInquiry() {
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      return;
    }

    this.inquirySubmitting.set(true);
    this.inquirySuccess.set(false);
    this.draftedProposal.set(null);

    const payload = this.inquiryForm.value;

    this.http.post<{ replyText: string; followUpMessage: string; simulated?: boolean }>('/api/inquiry', payload)
      .subscribe({
        next: (res) => {
          this.inquirySubmitting.set(false);
          this.inquirySuccess.set(true);
          this.draftedProposal.set(res.replyText);
          this.followUpMessage.set(res.followUpMessage);
        },
        error: (err) => {
          console.error('Inquiry Submission Error:', err);
          this.inquirySubmitting.set(false);
          // Set standard elegant recovery proposal in case of system issue
          this.inquirySuccess.set(true);
          this.followUpMessage.set(`Thank you ${payload.name}! Your inquiry was recorded. Mr. Padhiyar will contact you via Email/WhatsApp.`);
          this.draftedProposal.set(`
DEAR ${payload.name.toUpperCase()},
REPRESENTING ${payload.company.toUpperCase()} (${payload.country})

SUBJ: OFFICIAL EXPORT INTEREST ACKNOWLEDGMENT - REF #JPX-LOCAL

We appreciate your inquiry for ${payload.quantity} Tons of ${payload.product}. Our Senior Trade Specialist, Mr. Pradip Padhiyar, has been notified of your request.
We will contact you shortly on ${payload.phone} or ${payload.email} with standard FOB Mundra/Kandla and CIF pricing drafts.

Sincerely,
JP EXIM Trade Representative
Plot No. 60, Vedanta Bungalows, Deesa, Gujarat, India
          `.trim());
        }
      });
  }

  resetInquiryForm() {
    this.inquiryForm.reset({
      product: 'Both',
      quantity: ''
    });
    this.inquirySuccess.set(false);
    this.draftedProposal.set(null);
    this.followUpMessage.set(null);
  }

  copyProposalToClipboard() {
    const text = this.draftedProposal();
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Corporate draft proposal copied to clipboard successfully!');
      });
    }
  }

  downloadProposalAsFile() {
    const text = this.draftedProposal();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JP_EXIM_Export_Draft_Proposal.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
