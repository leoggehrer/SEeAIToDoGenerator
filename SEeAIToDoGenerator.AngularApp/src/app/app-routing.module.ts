import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';

const routes: Routes = [
  // Landing Page
  { path: '', component: LandingComponent },
  
  // Öffentlicher Login-Bereich
  { path: 'auth/login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Geschützter Bereich mit Dashboard und Unterseiten
  //{ path: 'protected', component: ProtectedListComponent, canActivate: [AuthGuard] },

  // Entity Routes
  { 
    path: 'todo-lists', 
    loadComponent: () => import('./pages/entities/app/todo-list-list.component').then(m => m.TodoListListComponent), 
    canActivate: [AuthGuard], 
    title: 'ToDo Lists' 
  },
  { 
    path: 'todo-tasks', 
    loadComponent: () => import('./pages/entities/app/todo-task-list.component').then(m => m.TodoTaskListComponent), 
    canActivate: [AuthGuard], 
    title: 'ToDo Tasks' 
  },
  {
    path: 'taskmind-generator',
    loadComponent: () => import('./pages/taskmind-generator/taskmind-generator.component').then(m => m.TaskmindGeneratorComponent),
    title: 'TaskMind Generator'
  },

  // Fallback bei ungültiger URL
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
