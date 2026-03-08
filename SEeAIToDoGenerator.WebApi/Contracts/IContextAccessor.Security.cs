//@CodeCopy
#if ACCOUNT_ON
namespace SEeAIToDoGenerator.WebApi.Contracts
{
    partial interface IContextAccessor
    {
        string SessionToken { set; }
    }
}
#endif
