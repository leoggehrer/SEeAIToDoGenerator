//@AiCode
namespace SEeAIToDoGenerator.Logic.Entities.App
{
    using Microsoft.EntityFrameworkCore;
    using SEeAIToDoGenerator.Logic.Modules.Exceptions;

    partial class TodoList : SEeAIToDoGenerator.Logic.Contracts.IValidatableEntity
    {
        public void Validate(SEeAIToDoGenerator.Logic.Contracts.IContext context, EntityState entityState)
        {
            bool handled = false;
            BeforeExecuteValidation(ref handled, context, entityState);

            if (!handled)
            {
                // Validate Title
                if (!IsTitleValid(Title))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(Title)} '{Title}' is not valid. Title must not be empty and cannot exceed 200 characters.");
                }

                // Validate Description
                if (!IsDescriptionValid(Description))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(Description)} is not valid. Description must not be empty and cannot exceed 1000 characters.");
                }

                // Validate TaskCount
                if (!IsTaskCountValid(TaskCount))
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(TaskCount)} '{TaskCount}' is not valid. TaskCount must be between 1 and 50.");
                }

                // Validate CreatedAt is in the past or present
                if (CreatedAt > DateTime.UtcNow)
                {
                    throw new BusinessRuleException(
                        $"The value of {nameof(CreatedAt)} cannot be in the future.");
                }
            }
        }

        #region methods
        /// <summary>
        /// Validates if the title is valid.
        /// </summary>
        /// <param name="value">The title to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsTitleValid(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Length <= 200;
        }

        /// <summary>
        /// Validates if the description is valid.
        /// </summary>
        /// <param name="value">The description to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsDescriptionValid(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Length <= 1000;
        }

        /// <summary>
        /// Validates if the task count is valid.
        /// </summary>
        /// <param name="value">The task count to validate.</param>
        /// <returns>True if valid, otherwise false.</returns>
        public static bool IsTaskCountValid(int value)
        {
            return value >= 1 && value <= 50;
        }
        #endregion methods

        #region partial methods
        partial void BeforeExecuteValidation(ref bool handled, SEeAIToDoGenerator.Logic.Contracts.IContext context, EntityState entityState);
        #endregion partial methods
    }
}
