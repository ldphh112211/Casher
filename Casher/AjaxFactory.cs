using CasherEntity;
using System;
using System.Web;
using CasherCommon;

namespace Casher
{
    public class AjaxFactory : IHttpHandlerFactory
    {
        public IHttpHandler GetHandler(HttpContext context, string requestType, string url, string pathTranslated)
        {
            HttpRequest request = context.Request;
            HttpResponse response = context.Response;
            response.ContentType = "application/json";
            Uri uri = request.Url;

            IHttpHandler ih = null;

            try
            {
                if (uri.Segments.Length > 1)
                {
                    if (uri.Segments[1].ToLower() == "ajax/")
                    {

                        ih = Activator.CreateInstance(typeof(requestHandler), false) as IHttpHandler;

                    }

                }
            }
            catch
            {
                response.Write(new ReturnInfo() { status = 9999, message = "接口访问参数不正确" }.ToJsJson());
            }

            return ih;
        }

        public void ReleaseHandler(IHttpHandler handler)
        {
            //throw new NotImplementedException();
        }
    }
}
