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
global using CommonModules = SEeAIToDoGenerator.Common.Modules;
global using SEeAIToDoGenerator.Common.Extensions;
global using CommonStaticLiterals = SEeAIToDoGenerator.Common.StaticLiterals;
global using TemplatePath = SEeAIToDoGenerator.Common.Modules.Template.TemplatePath;
