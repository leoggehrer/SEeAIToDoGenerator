//@AiCode
namespace SEeAIToDoGenerator.Logic.Entities.App
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using Microsoft.EntityFrameworkCore;
    using SEeAIToDoGenerator.Common.Enums;

#if SQLITE_ON
    [Table("TodoTasks")]
#else
    [Table("TodoTasks", Schema = "app")]
#endif
    [Index(nameof(TodoListId), nameof(SortOrder))]
    public partial class TodoTask : EntityObject
    {
        #region fields
        private string _text = string.Empty;
        private string _category = string.Empty;
        private IdType _todoListId;
        #endregion fields

        #region properties
        /// <summary>
        /// Gets or sets the foreign key to the todo list.
        /// </summary>
        public IdType TodoListId
        {
            get => _todoListId;
            set
            {
                _todoListId = value;
                _todoList = null; // Reset navigation property
            }
        }

        /// <summary>
        /// Gets or sets the task description text.
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string Text
        {
            get => _text;
            set
            {
                bool handled = false;
                OnTextChanging(ref handled, ref value);
                if (!handled)
                {
                    _text = value;
                }
                OnTextChanged(value);
            }
        }

        /// <summary>
        /// Gets or sets an optional note with additional information.
        /// </summary>
        [MaxLength(1000)]
        public string? Note { get; set; }

        /// <summary>
        /// Gets or sets the priority level of the task.
        /// </summary>
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        /// <summary>
        /// Gets or sets the category of the task.
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Category
        {
            get => _category;
            set
            {
                bool handled = false;
                OnCategoryChanging(ref handled, ref value);
                if (!handled)
                {
                    _category = value;
                }
                OnCategoryChanged(value);
            }
        }

        /// <summary>
        /// Gets or sets whether the task is completed.
        /// </summary>
        public bool IsDone { get; set; } = false;

        /// <summary>
        /// Gets or sets the sort order within the list.
        /// </summary>
        public int SortOrder { get; set; } = 0;
        #endregion properties

        #region navigation properties
        private TodoList? _todoList;

        /// <summary>
        /// Gets or sets the associated todo list.
        /// </summary>
        public TodoList? TodoList
        {
            get => _todoList;
            set
            {
                _todoList = value;
                if (value != null)
                {
                    _todoListId = value.Id;
                }
            }
        }
        #endregion navigation properties

        #region partial methods
        partial void OnTextChanging(ref bool handled, ref string value);
        partial void OnTextChanged(string value);
        partial void OnCategoryChanging(ref bool handled, ref string value);
        partial void OnCategoryChanged(string value);
        #endregion partial methods
    }
}
