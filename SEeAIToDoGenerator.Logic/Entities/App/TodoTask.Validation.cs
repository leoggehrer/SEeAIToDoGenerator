//@AiCode
namespace SEeAIToDoGenerator.Logic.Entities.App
{
    using Microsoft.EntityFrameworkCore;
    using SEeAIToDoGenerator.Logic.Modules.Exceptions;

    partial class TodoTask : SEeAIToDoGenerator.Logic.Contracts.IValidatableEntity
    {
        public void Validate(SEeAIToDoGenerator.Logic.Contracts.IContext context, EntityState entityState)
        {
            bool handled = false;
            BeforeExecuteValidation(ref handled, context, entityState);

            if (!handled)
            {
                // Validate Text
                if (!IsTextValid(Text))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(Text)} '{Text}' is not valid. Text must not be empty and cannot exceed 500 characters.");
                }

                // Validate Category
                if (!IsCategoryValid(Category))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(Category)} '{Category}' is not valid. Category must not be empty and cannot exceed 100 characters.");
                }

                // Validate Note length if provided
                if (Note != null && !IsNoteValid(Note))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(Note)} is not valid. Note cannot exceed 1000 characters.");
                }

                // Validate SortOrder
                if (!IsSortOrderValid(SortOrder))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(SortOrder)} '{SortOrder}' is not valid. SortOrder must be 0 or greater.");
                }

                // Validate TodoListId exists
                if (entityState == EntityState.Added || entityState == EntityState.Modified)
                {
                    if (TodoListId == 0)
                    {
                        throw new BusinessRuleException(
                            $"The {nameof(TodoListId)} must be set. A task must belong to a todo list.");
                    }
                }
            }
        }

        #region methods
        /// <summary>
        /// Validates if the text is valid.
        /// </summary>
        /// <param name="value">The text to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsTextValid(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Length <= 500;
        }

        /// <summary>
        /// Validates if the category is valid.
        /// </summary>
        /// <param name="value">The category to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsCategoryValid(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Length <= 100;
        }

        /// <summary>
        /// Validates if the note is valid.
        /// </summary>
        /// <param name="value">The note to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsNoteValid(string value)
        {
            return value.Length <= 1000;
        }

        /// <summary>
        /// Validates if the sort order is valid.
        /// </summary>
        /// <param name="value">The sort order to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsSortOrderValid(int value)
        {
            return value >= 0;
        }
        #endregion methods

        #region partial methods
        partial void BeforeExecuteValidation(ref bool handled, SEeAIToDoGenerator.Logic.Contracts.IContext context, EntityState entityState);
        #endregion partial methods
    }
}
