import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trade',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './trade.html',
})
export class Trade {}
