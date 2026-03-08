//@CustomCode
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TodoListBaseEditComponent }from '@app/components/entities/app/todo-list-base-edit.component';
import { DetailLevel } from '@app-enums/detail-level';
import { TodoStatus } from '@app-enums/todo-status';
@Component({
  standalone: true,
  selector:'app-todo-list-edit',
  imports: [ CommonModule, FormsModule, TranslateModule],
  templateUrl: './todo-list-edit.component.html',
  styleUrl: './todo-list-edit.component.css'
})
export class TodoListEditComponent extends TodoListBaseEditComponent implements OnInit {
  // Enum-Werte als Arrays für Dropdowns
  public detailLevels = Object.values(DetailLevel).filter(v => typeof v === 'number') as number[];
  public statuses = Object.values(TodoStatus).filter(v => typeof v === 'number') as number[];

  public override get title(): string {
    return this.editMode ? 'TODO_LIST_EDIT.EDIT_TITLE' : 'TODO_LIST_EDIT.CREATE_TITLE';
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }
}
