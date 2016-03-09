using System;

namespace CasherEntity
{
    public class ReturnInfo {
        public int status = 0;
        public string message;
    }

    [System.Xml.Serialization.XmlRootAttribute("ReturnInfo", Namespace = "", IsNullable = false)]
    public class ReturnInfo<T> : ReturnInfo {
        public T data;
    }

    public class ReturnValue<T> {
        public bool isexist;
        public T value;
    }
}
