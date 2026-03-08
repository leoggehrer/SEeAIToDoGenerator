//@CodeCopy
#if ACCOUNT_ON
namespace SEeAIToDoGenerator.Logic.Contracts
{
    partial interface IContext
    {
        #region properties
        /// <summary>
        /// Sets the session token.
        /// </summary>
        string SessionToken { set; }
        #endregion properties
    }
}
#endif
