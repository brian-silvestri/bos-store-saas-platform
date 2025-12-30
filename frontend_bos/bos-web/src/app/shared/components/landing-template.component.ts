import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingConfig } from '../models/landing-config.model';

@Component({
  selector: 'app-landing-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-template.component.html',
  styleUrls: ['./landing-template.component.css'],
})
export class LandingTemplateComponent {
  @Input({ required: true }) config!: LandingConfig;
}
