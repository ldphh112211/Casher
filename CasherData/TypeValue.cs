using System.Collections.Generic;
using System.Linq;
using CasherCommon;
using CasherEntity;

namespace CasherData
{
    public class TypeValue {
        public static ReturnValue<T> GetValue<T>(Dictionary<string, string> param, string key) {
            ReturnValue<T> rv = new ReturnValue<T>();
            if (param.Keys.Contains(key)) {
                rv.isexist = true;
                rv.value = Utils.ConvertType<T>(param[key]);
            }
            else {
                rv.isexist = false;
                rv.value = default(T);
            }
            return rv;
        }
    }
}
