import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-process',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './process.html',
})
export class Process {
  currentProcessTab = signal<'potato' | 'peanut'>('potato');

  setProcessTab(tab: 'potato' | 'peanut') {
    this.currentProcessTab.set(tab);
  }
}
