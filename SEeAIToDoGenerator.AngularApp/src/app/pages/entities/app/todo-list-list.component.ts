//@CustomCode
import { IdType, IdDefault } from '@app/models/i-key-model';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryParams } from '@app/models/base/i-query-params';
import { ITodoList } from '@app-models/entities/app/i-todo-list';
import { TodoListBaseListComponent }from '@app/components/entities/app/todo-list-base-list.component';
import { TodoListEditComponent }from '@app/components/entities/app/todo-list-edit.component';
@Component({
  standalone: true,
  selector:'app-todo-list-list',
  imports: [ CommonModule, FormsModule, TranslateModule, RouterModule ],
  templateUrl: './todo-list-list.component.html',
  styleUrl: './todo-list-list.component.css'
})
export class TodoListListComponent extends TodoListBaseListComponent {
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
    queryParams.filter = 'title.ToLower().Contains(@0) OR description.ToLower().Contains(@0)';
  }
  protected override getItemKey(item: ITodoList): IdType {
    return item?.id || IdDefault;
  }
  override get pageTitle(): string {
    return 'TodoLists';
  }
  override getEditComponent() {
    return TodoListEditComponent;
  }
}
