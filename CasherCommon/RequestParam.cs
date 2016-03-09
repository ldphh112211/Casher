using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Reflection;
using System.Web;

namespace CasherCommon
{
    public enum Method {
        GET,
        POST
    }
    public class RequestParam {
        /// <summary>
        /// 转换请求参数集合为数组
        /// </summary>
        /// <param name="request">请求集合</param>
        /// <returns></returns>
        public static Dictionary<string, string> GetRequestParamValue(HttpRequest request) {
            Method method = (Method)Enum.Parse(typeof(Method), request.RequestType);
            NameValueCollection coll = method.Equals(Method.GET) ? request.QueryString : request.Form;
            string[] requestItem = coll.AllKeys;

            Dictionary<string, string> param = new Dictionary<string, string>();

            if (requestItem.Length == 0) return null;

            for (int i = 0; i < requestItem.Length; i++) {
                string val = method == Method.GET ? request.QueryString[requestItem[i]] : request.Form[requestItem[i]];
                param.Add(requestItem[i], val);
            }

            return param;
        }
    }
}