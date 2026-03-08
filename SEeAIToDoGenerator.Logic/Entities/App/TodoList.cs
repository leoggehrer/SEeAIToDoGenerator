//@AiCode
namespace SEeAIToDoGenerator.Logic.Entities.App
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using Microsoft.EntityFrameworkCore;
    using SEeAIToDoGenerator.Common.Enums;

#if SQLITE_ON
    [Table("TodoLists")]
#else
    [Table("TodoLists", Schema = "app")]
#endif
    [Index(nameof(Title))]
    public partial class TodoList : EntityObject
    {
        #region fields
        private string _title = string.Empty;
        private string _description = string.Empty;
        #endregion fields

        #region properties
        /// <summary>
        /// Gets or sets the title of the todo list.
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Title
        {
            get => _title;
            set
            {
                bool handled = false;
                OnTitleChanging(ref handled, ref value);
                if (!handled)
                {
                    _title = value;
                }
                OnTitleChanged(value);
            }
        }

        /// <summary>
        /// Gets or sets the description of what is planned.
        /// </summary>
        [Required]
        [MaxLength(1000)]
        public string Description
        {
            get => _description;
            set
            {
                bool handled = false;
                OnDescriptionChanging(ref handled, ref value);
                if (!handled)
                {
                    _description = value;
                }
                OnDescriptionChanged(value);
            }
        }

        /// <summary>
        /// Gets or sets the desired number of tasks to generate.
        /// </summary>
        public int TaskCount { get; set; } = 8;

        /// <summary>
        /// Gets or sets the level of detail for generated tasks.
        /// </summary>
        public DetailLevel DetailLevel { get; set; } = DetailLevel.Medium;

        /// <summary>
        /// Gets or sets the current status of the todo list.
        /// </summary>
        public TodoStatus Status { get; set; } = TodoStatus.Ready;

        /// <summary>
        /// Gets or sets the creation timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        #endregion properties

        #region navigation properties
        /// <summary>
        /// Gets or sets the list of tasks belonging to this todo list.
        /// </summary>
        public List<TodoTask> TodoTasks { get; set; } = [];
        #endregion navigation properties

        #region partial methods
        partial void OnTitleChanging(ref bool handled, ref string value);
        partial void OnTitleChanged(string value);
        partial void OnDescriptionChanging(ref bool handled, ref string value);
        partial void OnDescriptionChanged(string value);
        #endregion partial methods
    }
}
