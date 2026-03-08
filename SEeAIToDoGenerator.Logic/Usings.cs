//@CodeCopy

#if IDINT_ON
global using IdType = System.Int32;
#elif IDLONG_ON
global using IdType = System.Int64;
#elif IDGUID_ON
global using IdType = System.Guid;
#else
global using IdType = System.Int32;
#endif
global using Common = SEeAIToDoGenerator.Common;
global using CommonEnums = SEeAIToDoGenerator.Common.Enums;
global using CommonContracts = SEeAIToDoGenerator.Common.Contracts;
global using CommonModels = SEeAIToDoGenerator.Common.Models;
global using CommonModules = SEeAIToDoGenerator.Common.Modules;
global using SEeAIToDoGenerator.Common.Extensions;
global using System.ComponentModel.DataAnnotations;
global using System.ComponentModel.DataAnnotations.Schema;
global using Microsoft.EntityFrameworkCore;
global using Validator = SEeAIToDoGenerator.Common.Modules.Validations.Validator;

