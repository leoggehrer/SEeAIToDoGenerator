import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '@app-services/auth.service';

export class DashboardCard {
  visible: boolean = true;
  title: string;
  text: string;
  type: string;
  bg: string;
  icon: string;
  constructor(visible: boolean = true, title: string, text: string, type: string, bg: string, icon: string) {
    this.visible = visible;
    this.title = title;
    this.text = text;
    this.type = type;
    this.bg = bg;
    this.icon = icon;
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  public publicCards: DashboardCard[] = [
    { visible: true, title: 'DASHBOARD.CARDS.TASKMIND_GENERATOR_TITLE', text: 'DASHBOARD.CARDS.TASKMIND_GENERATOR_TEXT', type: '/taskmind-generator', bg: 'bg-warning text-dark', icon: 'bi-stars' },
//    { visible: true, title: 'DASHBOARD.CARDS.DASHBOARD_TITLE', text: 'DASHBOARD.CARDS.DASHBOARD_TEXT', type: '/dashboard', bg: 'bg-primary text-white', icon: 'bi-speedometer2' },
  ];

  public authCards: DashboardCard[] = [
    { visible: true, title: 'DASHBOARD.CARDS.TODO_LISTS_TITLE', text: 'DASHBOARD.CARDS.TODO_LISTS_TEXT', type: '/todo-lists', bg: 'bg-primary text-white', icon: 'bi-list-task' },
    { visible: true, title: 'DASHBOARD.CARDS.TODO_TASKS_TITLE', text: 'DASHBOARD.CARDS.TODO_TASKS_TEXT', type: '/todo-tasks', bg: 'bg-success text-white', icon: 'bi-check2-square' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router) {

  }

  public get isLoginRequired(): boolean {
    return this.authService.isLoginRequired;
  }

  public get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  public get visiblePublicCards(): DashboardCard[] {
    return this.publicCards.filter(c => c.visible);
  }

  public get visibleAuthCards(): DashboardCard[] {
    return this.authCards.filter(c => c.visible);
  }

  public logout() {
    this.authService.logout();
  }
}
