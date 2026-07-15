import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-products',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './products.html',
})
export class Products {
  currentProductTab = signal<'potato' | 'peanut'>('potato');

  setProductTab(tab: 'potato' | 'peanut') {
    this.currentProductTab.set(tab);
  }
}
