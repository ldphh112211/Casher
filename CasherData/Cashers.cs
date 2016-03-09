using CasherEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using CasherCommon;

namespace CasherData
{
    public class Cashers
    {
        //Init Data
        private static List<ProductModel> proList = new List<ProductModel>();
        private static List<ActivityModel> actList = new List<ActivityModel>();
        private static List<ActivityProductRelModel> actproList = new List<ActivityProductRelModel>();
        /// <summary>
        /// 收银机
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        public static ReturnInfo Calculate(Dictionary<string, string> param)
        {
            //Init Data
            BindData();
            //测试情况
            ReturnValue<bool> sales = TypeValue.GetValue<bool>(param, "sales");
            ReturnValue<bool> send = TypeValue.GetValue<bool>(param, "send");
            //数据
            ReturnValue<string> data = TypeValue.GetValue<string>(param, "data");
            //JSON反序列化
            Array arr = data.value.FromJsonTo<Array>();
            CasherResult result = new CasherResult();
            List<CasherModel> cashlist = new List<CasherModel>();
            List<ActivityCasher> aclist = new List<ActivityCasher>();
            decimal totalprice = 0;
            //计算购买量,先计算总价数据，待数量等统计完成后再搜寻优惠信息
            foreach (string item in arr)
            {
                string[] proinfo = item.Split('-');
                if (proinfo.Length > 1)
                {
                    //称重商品
                    ProductModel pro = ReturnModel(proinfo[0]);
                    //验证是否为称重商品
                    if (pro.type == "斤" && decimal.Parse(proinfo[1]) > 0)
                    {
                        CasherModel cmodel = new CasherModel
                        {
                            pid = pro.id,
                            code = pro.code,
                            name = pro.name,
                            price = pro.price,
                            type = pro.type,
                            count = decimal.Parse(proinfo[1]),
                            discount = 0,
                            total = pro.price * decimal.Parse(proinfo[1])
                        };
                        cashlist.Add(cmodel);//加入列表中
                        totalprice += cmodel.total;//计算总价
                    }
                }
                else
                {
                    //搜索casherlist中是否存在该商品
                    if (isHaveProduct(item, cashlist))
                    {
                        continue;
                    }
                    ProductModel pro = ReturnModel(item);
                    if (pro == null)
                    {
                        continue;
                    }
                    //统计该编码商品数量
                    int count = ReturnProductCount(item, arr);
                    if (count > 0)
                    {
                        CasherModel cmodel = new CasherModel
                        {
                            pid = pro.id,
                            code = pro.code,
                            name = pro.name,
                            price = pro.price,
                            type = pro.type,
                            count = count,
                            discount = 0,
                            total = pro.price * count
                        };
                        cashlist.Add(cmodel);//加入列表中
                        totalprice += cmodel.total;//计算总价
                    }
                }

            }
            //查询优惠,
            if (sales.value || send.value)
            {
                int account = 0;
                foreach (var item in cashlist)
                {
                    //根据商品id查询优惠活动信息，sql可直接查出，在此依靠遍历list,找出最适当的活动id
                    int actid = 0;
                    foreach (var item2 in actproList)
                    {
                        if (item.pid == item2.pid)
                        {
                            //存在优惠活动
                            if (actid > 0)
                            {
                                //选择器。判断选择哪个优惠活动，根据ismain字节判断，由0开始优先级逐步降低
                                ActivityModel act1 = GetActivityModel(actid);
                                ActivityModel act2 = GetActivityModel(item2.aid);
                                if (act1 == null || act2 == null)
                                {
                                    continue;
                                }
                                //假如两种优惠都满足，则筛选ismain
                                actid = act1.ismain < act2.ismain ? act1.id : act2.id;
                                if (act1.ismain < act2.ismain)
                                {
                                    if (act1.from > 1 && item.count >= (act1.from + act1.discount))
                                    {
                                        actid = act1.id;
                                    }
                                    else actid = act2.id;
                                }
                                else
                                {
                                    if (act2.from > 1 && item.count >= (act2.from + act2.discount))
                                    {
                                        actid = act2.id;
                                    }
                                    else actid = act1.id;
                                }
                            }
                            else
                                actid = item2.aid;
                        }
                    }
                    //更新优惠信息
                    if (actid > 0)
                    {
                        ActivityModel amodel = GetActivityModel(actid);
                        if (amodel == null)
                        {
                            continue;//数据完整判断
                        }
                        if (amodel.from < 1 && sales.value)
                        {
                            //折扣商品
                            item.discount = item.total * (1 - amodel.from);
                            item.total = item.total * amodel.from;
                            totalprice -= item.discount;
                            result.discountprice += item.discount;
                        }
                        if (amodel.from >= 1 && send.value)
                        {
                            //买赠商品
                            if (account == 0)
                            {
                                result.title = amodel.title;
                            }
                            //计算优惠个数
                            int discount = (int)item.count / ((int)amodel.from + (int)amodel.discount) * (int)amodel.discount;
                            decimal discountprice = discount * item.price;
                            item.total -= item.price * discount;
                            ActivityCasher acmodel = new ActivityCasher
                            {
                                pid = item.pid,
                                count = discount,
                                name = item.name,
                                type = item.type
                            };
                            aclist.Add(acmodel);
                            totalprice -= discountprice;
                            result.discountprice += discountprice;
                        }
                    }
                }
            }
            result.aclist = aclist;
            result.casherlist = cashlist;
            result.totalprice = totalprice;

            return new ReturnInfo<CasherResult> { data = result, message = data.value };
        }

        #region 私有方法 By LDP


        /// <summary>
        /// 初始化数据
        /// </summary>
        private static void BindData()
        {
            //商品数据
            proList.Add(new ProductModel { id = 1, code = "ITEM000001", name = "羽毛球", price = 1.00M, type = "个" });
            proList.Add(new ProductModel { id = 3, code = "ITEM000003", name = "苹果", price = 5.50M, type = "斤" });
            proList.Add(new ProductModel { id = 5, code = "ITEM000005", name = "可口可乐", price = 3.00M, type = "瓶" });
            //活动信息
            actList.Add(new ActivityModel { id = 1, title = "95折", from = 0.95M, discount = 0, ismain = 1 });
            actList.Add(new ActivityModel { id = 2, title = "买二赠一", from = 2, discount = 1, ismain = 0 });
            //活动商品关联
            actproList.Add(new ActivityProductRelModel { aid = 1, pid = 3 });//95折苹果
            actproList.Add(new ActivityProductRelModel { aid = 1, pid = 1 });//95折羽毛球
            actproList.Add(new ActivityProductRelModel { aid = 2, pid = 1 });//买二送一
            actproList.Add(new ActivityProductRelModel { aid = 2, pid = 5 });//买二送一
        }
        /// <summary>
        /// 找到该商品
        /// </summary>
        /// <param name="code">商品码</param>
        /// <returns></returns>
        private static ProductModel ReturnModel(string code)
        {
            foreach (var item in proList)
            {
                if (item.code == code) return item;
            }
            return null;
        }
        /// <summary>
        /// 得到商品数量
        /// </summary>
        /// <param name="code">商品码</param>
        /// <param name="arr"></param>
        /// <returns></returns>
        private static int ReturnProductCount(string code, Array arr)
        {
            int count = 0;
            foreach (string item in arr)
            {
                if (item == code) count++;
            }
            return count;
        }
        /// <summary>
        /// 判断是否存在该商品
        /// </summary>
        /// <param name="code"></param>
        /// <param name="casherlist"></param>
        /// <returns></returns>
        private static bool isHaveProduct(string code, List<CasherModel> casherlist)
        {
            if (casherlist != null)
            {
                foreach (var item in casherlist)
                {
                    if (item.code == code) return true;
                }
            }
            return false;
        }
        /// <summary>
        /// 获取活动Model
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private static ActivityModel GetActivityModel(int id)
        {
            foreach (var item in actList)
            {
                if (item.id == id) return item;
            }
            return null;
        }
        #endregion
    }
}
