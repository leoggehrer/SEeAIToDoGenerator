//@CustomCode
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TodoTaskBaseEditComponent }from '@app/components/entities/app/todo-task-base-edit.component';
import { TaskPriority } from '@app-enums/task-priority';
import { ITodoList } from '@app-models/entities/app/i-todo-list';
import { TodoListService } from '@app-services/http/entities/app/todo-list-service';
@Component({
  standalone: true,
  selector:'app-todo-task-edit',
  imports: [ CommonModule, FormsModule, TranslateModule],
  templateUrl: './todo-task-edit.component.html',
  styleUrl: './todo-task-edit.component.css'
})
export class TodoTaskEditComponent extends TodoTaskBaseEditComponent implements OnInit {
  // Arrays für Dropdowns
  public todoLists: ITodoList[] = [];
  public priorities = Object.values(TaskPriority).filter(v => typeof v === 'number') as number[];

  // Services injizieren
  private todoListService = inject(TodoListService);

  public override get title(): string {
    return this.editMode ? 'TODO_TASK_EDIT.EDIT_TITLE' : 'TODO_TASK_EDIT.CREATE_TITLE';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadTodoLists();
  }

  private loadTodoLists(): void {
    this.todoListService.getAll().subscribe({
      next: (data) => this.todoLists = data,
      error: (error) => console.error('Error loading todo lists:', error)
    });
  }
}
