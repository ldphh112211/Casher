using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Web;
using System.IO;
using System.Xml;

namespace CasherCommon
{
    public class Utils {

        public static string ReadResourceHtml(string resName) {
#if DEBUG
            StreamReader sr = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "Html\\" + resName, Encoding.UTF8);
#else
            string ns = MethodBase.GetCurrentMethod().DeclaringType.Namespace;
            Assembly assembly = Assembly.Load(ns.Remove(ns.LastIndexOf('.')));
            StreamReader sr = new StreamReader(assembly.GetManifestResourceStream(assembly.GetName().Name + ".Html." + resName), Encoding.UTF8);
#endif
            if (sr != null) {
                string html = sr.ReadToEnd();
                sr.Close();
                return html;
            }
            else throw new Exception("未找到资源 " + resName);
        }

        /// <summary>
        /// 获取时间参数 
        /// </summary>
        /// <returns></returns>
        public static string GetTsParam() {
#if DEBUG
            return string.Empty;
#else
            return "?_v=" + new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "Release.txt").LastWriteTime.ToString("yyMMddHHmm");
#endif
        }

        /// <summary>
        /// 泛型类型转换
        /// </summary>
        /// <typeparam name="T">要转换的基础类型</typeparam>
        /// <param name="val">要转换的值</param>
        /// <returns></returns>
        public static T ConvertType<T>(object val) {
            if (val == null || val == DBNull.Value) return default(T);//返回类型的默认值

            Type tp = typeof(T);
            //泛型Nullable判断，取其中的类型
            if (tp.IsGenericType) {
                tp = tp.GetGenericArguments()[0];
            }
            //string直接返回转换
            if (tp == typeof(string)) {
                val = val.ToString();
                return (T)val;
            }
            //其它的值类型值 需要先转换成字符串类型
            if (val.GetType().IsValueType && val.GetType() != typeof(string)) val = val.ToString();
            //反射获取TryParse方法
            MethodInfo TryParse = tp.GetMethod("TryParse", BindingFlags.Public | BindingFlags.Static, Type.DefaultBinder,
                                            new Type[] { typeof(string), tp.MakeByRefType() },
                                            new ParameterModifier[] { new ParameterModifier(2) });
            object[] parameters = new object[] { val, Activator.CreateInstance(tp) };
            bool success = (bool)TryParse.Invoke(null, parameters);
            //成功返回转换后的值，否则返回类型的默认值
            if (success) return (T)parameters[1];
            else return default(T);
        }

   
    }
}
