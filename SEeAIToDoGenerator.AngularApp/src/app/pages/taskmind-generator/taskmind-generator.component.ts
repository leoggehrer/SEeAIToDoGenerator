import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { DetailLevel } from '@app-enums/detail-level';
import { TaskPriority } from '@app-enums/task-priority';
import { TodoStatus } from '@app-enums/todo-status';
import { ITodoList } from '@app-models/entities/app/i-todo-list';
import { ITodoTask } from '@app-models/entities/app/i-todo-task';
import { TodoListService } from '@app-services/http/entities/app/todo-list-service';
import { TodoTaskService } from '@app-services/http/entities/app/todo-task-service';

type UiDetailLevel = 'kurz' | 'mittel' | 'detailliert';
type PriorityLevel = 'high' | 'medium' | 'low';

interface GeneratedTodo {
  text: string;
  note?: string;
  priority?: PriorityLevel;
  category?: string;
}

interface GenerationResult {
  title: string;
  todos: GeneratedTodo[];
}

interface TodoGroup {
  category: string;
  items: ITodoTask[];
}

@Component({
  selector: 'app-taskmind-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './taskmind-generator.component.html',
  styleUrl: './taskmind-generator.component.css'
})
export class TaskmindGeneratorComponent {
  private readonly todoListService = inject(TodoListService);
  private readonly todoTaskService = inject(TodoTaskService);
  private readonly translateService = inject(TranslateService);

  public readonly todoStatus = TodoStatus;

  public lists: ITodoList[] = [];
  public tasksByListId = new Map<number, ITodoTask[]>();
  public activeListId: number | null = null;
  public searchTerm = '';

  public descInput = '';
  public optCount = 8;
  public optDetail: UiDetailLevel = 'mittel';
  public webhookUrl = environment.AI_TODO_WEBHOOK_URL;
  public isLoading = false;

  public readonly countOptions = [5, 8, 12, 15];
  public readonly detailOptions: Array<{ value: UiDetailLevel; labelKey: string }> = [
    { value: 'kurz', labelKey: 'TASKMIND.DETAIL.SHORT' },
    { value: 'mittel', labelKey: 'TASKMIND.DETAIL.MEDIUM' },
    { value: 'detailliert', labelKey: 'TASKMIND.DETAIL.DETAILED' }
  ];

  public constructor() {
    this.loadFromDatabase();
  }

  public get activeList(): ITodoList | undefined {
    return this.lists.find(l => l.id === this.activeListId);
  }

  public get filteredLists(): ITodoList[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.lists;
    }

    return this.lists.filter(list => {
      const title = (list.title || '').toLowerCase();
      const description = (list.description || '').toLowerCase();
      return title.includes(term) || description.includes(term);
    });
  }

  public get groupedTodos(): TodoGroup[] {
    const tasks = this.activeList ? this.tasksOf(this.activeList) : [];
    const groups = new Map<string, ITodoTask[]>();

    tasks.forEach(task => {
      const category = task.category || 'Allgemein';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)?.push(task);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
  }

  public trackByListId(_index: number, list: ITodoList): number {
    return list.id;
  }

  public trackByCategory(_index: number, group: TodoGroup): string {
    return group.category;
  }

  public trackByTaskId(_index: number, task: ITodoTask): number {
    return task.id;
  }

  public async generateList(): Promise<void> {
    const desc = this.descInput.trim();
    if (!desc) {
      alert(this.translateService.instant('TASKMIND.ALERTS.DESCRIPTION_REQUIRED'));
      return;
    }

    const webhookUrl = this.webhookUrl.trim();
    if (!webhookUrl) {
      alert(this.translateService.instant('TASKMIND.ALERTS.WEBHOOK_NOT_CONFIGURED'));
      return;
    }

    this.isLoading = true;
    let createdList: ITodoList | null = null;

    try {
      createdList = await this.createGeneratingList(desc);
      this.lists.unshift(createdList);
      this.tasksByListId.set(createdList.id, []);
      this.activeListId = createdList.id;

      const payload = {
        listId: String(createdList.id),
        description: desc,
        count: this.optCount,
        detail: this.mapDetailForPayload(this.optDetail),
        timestamp: Date.now().toString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const raw = await response.json() as unknown;
      const result = this.normalizeGenerationResult(raw, desc.substring(0, 40));
      const savedTasks = await this.createTasksForList(createdList.id, result.todos || []);

      const updatedList = await firstValueFrom(this.todoListService.update({
        ...createdList,
        title: result.title || desc.substring(0, 40),
        taskCount: this.withMinTaskCount(savedTasks.length),
        status: TodoStatus.Ready,
        detailLevel: this.toDetailLevelEnum(this.optDetail),
        todoTasks: []
      }));

      this.replaceList(updatedList);
      this.tasksByListId.set(updatedList.id, savedTasks.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      if (createdList) {
        const errored = { ...createdList, status: TodoStatus.Error, taskCount: this.withMinTaskCount(createdList.taskCount), todoTasks: [] };
        this.replaceList(errored);
        try {
          await firstValueFrom(this.todoListService.update(errored));
        } catch {
          // Keep UI status even when backend update fails.
        }
      } else {
        alert(this.translateService.instant('TASKMIND.ALERTS.DB_SAVE_FAILED'));
      }
    } finally {
      this.isLoading = false;
      this.descInput = '';
    }
  }

  public selectList(listId: number): void {
    this.activeListId = listId;
  }

  public async deleteList(listId: number): Promise<void> {
    this.lists = this.lists.filter(l => l.id !== listId);
    this.tasksByListId.delete(listId);

    if (this.activeListId === listId) {
      this.activeListId = this.lists[0]?.id ?? null;
    }

    try {
      const tasks = await firstValueFrom(this.todoTaskService.getAll());
      const related = tasks.filter(t => t.todoListId === listId);
      await Promise.all(related.map(t => firstValueFrom(this.todoTaskService.deleteById(t.id))));
      await firstValueFrom(this.todoListService.deleteById(listId));
    } catch {
      // Keep UI responsive even if backend cleanup fails.
    }
  }

  public async toggleTodo(listId: number, taskId: number): Promise<void> {
    const tasks = this.tasksByListId.get(listId) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return;
    }

    const previous = task.isDone;
    task.isDone = !task.isDone;

    try {
      await firstValueFrom(this.todoTaskService.update({ ...task }));
    } catch {
      task.isDone = previous;
    }
  }

  public async deleteTodo(listId: number, taskId: number): Promise<void> {
    const tasks = this.tasksByListId.get(listId) || [];
    this.tasksByListId.set(listId, tasks.filter(t => t.id !== taskId));

    try {
      await firstValueFrom(this.todoTaskService.deleteById(taskId));
      await this.syncTaskCount(listId);
    } catch {
      // Keep UI responsive even if backend delete fails.
    }
  }

  public async clearDone(listId: number): Promise<void> {
    const tasks = this.tasksByListId.get(listId) || [];
    const doneTasks = tasks.filter(t => t.isDone);

    if (doneTasks.length === 0) {
      return;
    }

    this.tasksByListId.set(listId, tasks.filter(t => !t.isDone));

    try {
      await Promise.all(doneTasks.map(t => firstValueFrom(this.todoTaskService.deleteById(t.id))));
      await this.syncTaskCount(listId);
    } catch {
      // Keep UI responsive even if backend cleanup fails.
    }
  }

  public tasksOf(list: ITodoList): ITodoTask[] {
    return this.tasksByListId.get(list.id) || [];
  }

  public doneCount(list?: ITodoList): number {
    const tasks = list ? this.tasksOf(list) : [];
    return tasks.filter(t => t.isDone).length;
  }

  public progressPct(list?: ITodoList): number {
    const tasks = list ? this.tasksOf(list) : [];
    if (tasks.length === 0) {
      return 0;
    }
    return Math.round((this.doneCount(list) / tasks.length) * 100);
  }

  public levelLabel(level: DetailLevel): string {
    if (level === DetailLevel.Short) {
      return 'TASKMIND.DETAIL.SHORT';
    }
    if (level === DetailLevel.Detailed) {
      return 'TASKMIND.DETAIL.DETAILED';
    }
    return 'TASKMIND.DETAIL.MEDIUM';
  }

  public priorityClass(priority: TaskPriority): string {
    if (priority === TaskPriority.High) {
      return 'prio-high';
    }
    if (priority === TaskPriority.Medium) {
      return 'prio-medium';
    }
    return 'prio-low';
  }

  public priorityLabel(priority: TaskPriority): string {
    if (priority === TaskPriority.High) {
      return 'TASKMIND.PRIORITY.HIGH';
    }
    if (priority === TaskPriority.Medium) {
      return 'TASKMIND.PRIORITY.MEDIUM';
    }
    return 'TASKMIND.PRIORITY.LOW';
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const [dbLists, dbTasks] = await Promise.all([
        firstValueFrom(this.todoListService.getAll()),
        firstValueFrom(this.todoTaskService.getAll())
      ]);

      const map = new Map<number, ITodoTask[]>();
      dbTasks.forEach(task => {
        if (!map.has(task.todoListId)) {
          map.set(task.todoListId, []);
        }
        map.get(task.todoListId)?.push(task);
      });

      this.tasksByListId = map;
      this.lists = dbLists
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.lists.forEach(list => {
        const tasks = this.tasksByListId.get(list.id) || [];
        this.tasksByListId.set(list.id, tasks.sort((a, b) => a.sortOrder - b.sortOrder));
      });

      this.activeListId = this.lists[0]?.id ?? null;
    } catch {
      this.lists = [];
      this.tasksByListId.clear();
      this.activeListId = null;
    }
  }

  private async createGeneratingList(description: string): Promise<ITodoList> {
    const template: ITodoList = {
      id: 0,
      title: description.substring(0, 40),
      description,
      taskCount: this.withMinTaskCount(this.optCount),
      detailLevel: this.toDetailLevelEnum(this.optDetail),
      status: TodoStatus.Generating,
      createdAt: new Date(),
      todoTasks: []
    };

    return firstValueFrom(this.todoListService.create(template));
  }

  private async createTasksForList(todoListId: number, todos: GeneratedTodo[]): Promise<ITodoTask[]> {
    const createCalls = todos.map((todo, index) => {
      const task: ITodoTask = {
        id: 0,
        todoListId,
        text: todo.text,
        note: todo.note ?? null,
        priority: this.toTaskPriority(todo.priority),
        category: todo.category || 'Allgemein',
        isDone: false,
        sortOrder: index + 1,
        todoList: null
      };
      return firstValueFrom(this.todoTaskService.create(task));
    });

    return Promise.all(createCalls);
  }

  private async syncTaskCount(listId: number): Promise<void> {
    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      return;
    }

    const tasks = this.tasksByListId.get(listId) || [];
    const updated = { ...list, taskCount: this.withMinTaskCount(tasks.length), todoTasks: [] };

    try {
      const saved = await firstValueFrom(this.todoListService.update(updated));
      this.replaceList(saved);
    } catch {
      // Ignore sync errors and keep current UI count.
    }
  }

  private replaceList(updated: ITodoList): void {
    const index = this.lists.findIndex(l => l.id === updated.id);
    if (index >= 0) {
      this.lists[index] = updated;
    } else {
      this.lists.unshift(updated);
    }
  }

  private mapDetailForPayload(level: UiDetailLevel): string {
    const detailMap: Record<UiDetailLevel, string> = {
      kurz: 'Kurz',
      mittel: 'Mittel',
      detailliert: 'Detailliert'
    };
    return detailMap[level];
  }

  private toDetailLevelEnum(level: UiDetailLevel): DetailLevel {
    const map: Record<UiDetailLevel, DetailLevel> = {
      kurz: DetailLevel.Short,
      mittel: DetailLevel.Medium,
      detailliert: DetailLevel.Detailed
    };
    return map[level];
  }

  private toTaskPriority(priority: PriorityLevel | undefined): TaskPriority {
    if (priority === 'high') {
      return TaskPriority.High;
    }
    if (priority === 'medium') {
      return TaskPriority.Medium;
    }
    return TaskPriority.Low;
  }

  private normalizeGenerationResult(raw: unknown, fallbackTitle: string): GenerationResult {
    const firstItem = Array.isArray(raw) ? raw[0] : raw;
    const sourceObject = this.asRecord(firstItem);
    const nested = sourceObject
      ? (this.asRecord(sourceObject['data']) || this.asRecord(sourceObject['result']) || this.asRecord(sourceObject['output']))
      : null;
    const payload = nested || sourceObject;

    const title = typeof payload?.['title'] === 'string' ? payload['title'] : fallbackTitle;
    const todosRaw = Array.isArray(payload?.['todos']) ? payload['todos'] : [];

    const todos: GeneratedTodo[] = todosRaw
      .map(item => this.asRecord(item))
      .filter((item): item is Record<string, unknown> => !!item)
      .map(item => ({
        text: typeof item['text'] === 'string' ? item['text'] : '',
        note: typeof item['note'] === 'string' ? item['note'] : undefined,
        priority: this.normalizePriority(item['priority']),
        category: typeof item['category'] === 'string' ? item['category'] : undefined
      }))
      .filter(item => item.text.length > 0);

    return { title, todos };
  }

  private normalizePriority(value: unknown): PriorityLevel | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.toLowerCase();
    if (normalized === 'high' || normalized === 'medium' || normalized === 'low') {
      return normalized;
    }

    return undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }

  private withMinTaskCount(value: number): number {
    return Math.max(1, value || 0);
  }
}
