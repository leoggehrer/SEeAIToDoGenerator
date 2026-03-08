//@CustomCode
import { IdType, IdDefault } from '@app/models/i-key-model';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryParams } from '@app/models/base/i-query-params';
import { ITodoTask } from '@app-models/entities/app/i-todo-task';
import { TodoTaskBaseListComponent }from '@app/components/entities/app/todo-task-base-list.component';
import { TodoTaskEditComponent }from '@app/components/entities/app/todo-task-edit.component';
@Component({
  standalone: true,
  selector:'app-todo-task-list',
  imports: [ CommonModule, FormsModule, TranslateModule, RouterModule ],
  templateUrl: './todo-task-list.component.html',
  styleUrl: './todo-task-list.component.css'
})
export class TodoTaskListComponent extends TodoTaskBaseListComponent {
  constructor()
  {
    super();
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.reloadData();
  }
  override prepareQueryParams(queryParams: IQueryParams): void {
    super.prepareQueryParams(queryParams);
    queryParams.filter = 'text.ToLower().Contains(@0) OR note.ToLower().Contains(@0) OR category.ToLower().Contains(@0)';
  }
  protected override getItemKey(item: ITodoTask): IdType {
    return item?.id || IdDefault;
  }
  override get pageTitle(): string {
    return 'TodoTasks';
  }
  override getEditComponent() {
    return TodoTaskEditComponent;
  }
}
