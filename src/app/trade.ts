import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { 
  INCOTERMS_DATA, 
  PAYMENT_TERMS_DATA, 
  EXPORT_DOCUMENTS_DATA, 
  VALUE_BADGES_DATA 
} from './models/trade-protocols';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trade',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './trade.html',
})
export class Trade {
  // Expose Model Data to the View
  incoterms = signal(INCOTERMS_DATA);
  paymentTerms = signal(PAYMENT_TERMS_DATA);
  exportDocuments = signal(EXPORT_DOCUMENTS_DATA);
  valueBadges = signal(VALUE_BADGES_DATA);
}
