using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CasherEntity
{
    #region 数据结构

    public class ProductModel
    {
        public int id;
        public string code;
        public string name; //名称
        public string type; //计量单位
        public decimal price; //单位
    }
    public class CasherModel
    {
        public int pid;
        public string code;
        public string name;
        public string type; //计量单位，当使用折扣时，称重商品显示优惠总价
        public decimal count; //数量
        public decimal price; //单价
        public decimal total; //总价
        public decimal discount; //优惠价格
    }

    public class ActivityModel
    {
        public int id;
        public string title;//标题
        public decimal from;//源数量，当from<1，则为折扣,
        public decimal discount; //优惠数量
        public int ismain;//优先级，0最高，依次递增
    }
    public class ActivityProductRelModel
    {
        public int aid;
        public int pid;
    }

    public class CasherResult : ActivityCasherList
    {
        public List<CasherModel> casherlist;
        public decimal totalprice = 0;//总价
        public decimal discountprice = 0;//优惠价格
    }
    public class ActivityCasherList
    {
        public string title; //优惠标题
        public List<ActivityCasher> aclist; //优惠列表
    }
    public class ActivityCasher
    {
        public int pid;
        public string name;
        public string type; //计量单位，当使用折扣时，称重商品显示优惠总价
        public int count; //数量
    }

    #endregion
}
