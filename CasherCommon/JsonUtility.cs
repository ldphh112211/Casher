using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CasherCommon
{
    public static class JsonUtility {
        /// <summary> 
        /// 返回对象序列化
        /// </summary> 
        /// <param name="obj">源对象</param> 
        /// <returns>Json数据</returns> 
        public static string ToJsJson(this object obj) {
            JavaScriptSerializer serialize = new JavaScriptSerializer();
            return serialize.Serialize(obj);
        }

        /// <summary>
        /// 返回对象序列化 特定类型 特定格式
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string ToJsJsonCustomFormat<T>(this object obj) {
            JavaScriptSerializer serialize = new JavaScriptSerializer();
            serialize.RegisterConverters(new JavaScriptConverter[] { new ValueFormat<T>() });
            return serialize.Serialize(obj);
        }

        /// <summary>
        /// Json反序列化,用于接收客户端Json后生成对应的对象
        /// </summary>
        public static T FromJsonTo<T>(this string jsonString) {
            DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(T));
            MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(jsonString));
            T jsonObject = (T)ser.ReadObject(ms);
            ms.Close();
            return jsonObject;
        }

    }

    /// <summary>
    /// 自定义JSON内容值格式
    /// </summary>
    public class ValueFormat<T> : JavaScriptConverter {
        public override IDictionary<string, object> Serialize(object obj, JavaScriptSerializer serializer) {
            return SearchType(obj);
        }

        public override IEnumerable<Type> SupportedTypes {
            get { return new ReadOnlyCollection<Type>(new Type[] { typeof(T) }); }
        }

        public override object Deserialize(IDictionary<string, object> dictionary, Type type, JavaScriptSerializer serializer) {
            throw new NotImplementedException();
        }

        public Dictionary<string, object> SearchType(object obj) {
            Dictionary<string, object> result = new Dictionary<string, object>();
            Type objectType = obj.GetType();
            foreach (var fieldInfo in objectType.GetFields()) {
                dynamic fieldValue = fieldInfo.GetValue(obj);
                //除string的值类型
                if (fieldInfo.FieldType.IsValueType) {
                    if (fieldInfo.FieldType == typeof(float)) {
                        result.Add(fieldInfo.Name, string.Format("{0:f2}", fieldValue));
                    }
                    else if (fieldInfo.FieldType == typeof(DateTime) || fieldInfo.FieldType == typeof(DateTime?)) {
                        if (fieldValue != null) result.Add(fieldInfo.Name, string.Format("{0:yyyy-MM-dd HH:mm:ss}", fieldValue));
                        else result.Add(fieldInfo.Name, fieldValue);
                    }
                    else result.Add(fieldInfo.Name, fieldValue);
                }
                else if (fieldInfo.FieldType.IsGenericType && fieldInfo.FieldType.GetGenericTypeDefinition() == typeof(List<>)) {
                    List<Dictionary<string, object>> lstos = new List<Dictionary<string, object>>();
                    foreach (var item in fieldValue) {
                        lstos.Add(SearchType(item));
                    }
                    result.Add(fieldInfo.Name, lstos);
                }
                else if (fieldInfo.FieldType.IsClass && fieldInfo.FieldType != typeof(string)) {
                    result.Add(fieldInfo.Name, SearchType(fieldInfo));
                }
                else result.Add(fieldInfo.Name, fieldValue);
            }
            return result;
        }

    }
}
