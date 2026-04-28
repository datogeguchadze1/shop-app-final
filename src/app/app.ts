import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './saziaro/components/navbar/navbar.component';
import { FooterComponent } from './saziaro/components/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
})
export class App {}
