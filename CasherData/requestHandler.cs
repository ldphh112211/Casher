using System;
using System.Collections.Generic;
using System.Reflection;
using System.Web;
using CasherEntity;
using System.Web.SessionState;
using CasherCommon;

namespace Casher
{
    public class requestHandler : IHttpHandler, IRequiresSessionState
    {
        static Dictionary<string, string> dicExt = new Dictionary<string, string>() {            
               {"test", "Cashers"},
               {"calculate","Cashers"}
        };

        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            HttpRequest request = context.Request;
            HttpResponse response = context.Response;
            Uri uri = request.Url;
            response.ContentType = "application/json";

            if (uri.Segments.Length > 2 && dicExt.ContainsKey(uri.Segments[2].ToLower()))
            {
                Type t = Type.GetType(string.Concat("CasherData.", dicExt[uri.Segments[2].ToLower()]));
                object classact = Activator.CreateInstance(t);
                try
                {
                    MethodInfo mi = t.GetMethod(uri.Segments[2], BindingFlags.IgnoreCase | BindingFlags.Instance | BindingFlags.Public | BindingFlags.Static);
                    if (mi == null) { response.Write(new ReturnInfo() { status = -9997, message = "无法找到方法，请确认方法名称和参数个数是否正确" }.ToJsJson()); return; }
                    Dictionary<string, string> param = RequestParam.GetRequestParamValue(request);
                    object result = null;
                    if (param == null)
                    {
                        if (mi.GetParameters().Length > 0)
                        {
                            response.Write(new ReturnInfo() { status = -9997, message = "参数个数不正确" }.ToJsJson());
                            return;
                        }
                        result = mi.Invoke(classact, null);
                    }
                    else
                    {
                        result = mi.Invoke(classact, new object[] { param });
                    }
                    if (result.GetType() == typeof(string)) response.Write(result);
                    else response.Write(result.ToJsJson());
                }
                catch (Exception e)
                {
                    response.StatusCode = 500;
                    response.Write(new ReturnInfo() { status = -9999, message = e.InnerException == null ? e.Message : e.InnerException.Message }.ToJsJson());
                }
            }
            else
            {
                response.StatusCode = 301;
                response.Write(new ReturnInfo() { status = -9998, message = "登录错误" }.ToJsJson());
            }
        }
    }
}
