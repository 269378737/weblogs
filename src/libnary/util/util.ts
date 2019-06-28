
export default {
  install(Vue: any) {
    const vm = new Vue();

    /**
     * 操作成功提示框
     * @param { msg } 提示信息
     */
    Vue.prototype.vmMsgSuccess = (msg: string = '操作成功！'): void => {
      vm.$message({
        showClose: true,
        message  : msg,
        type     : 'success',
      });
    };

    /**
     * 操作告警提示框
     * @param { msg } 提示信息
     */
    Vue.prototype.vmMsgWarning = (msg: string = '无法进行当前操作！'): void => {
      vm.$message({
        showClose: true,
        message  : msg,
        type     : 'warning',
      });
    };

    /**
     * 操作错误提示框
     * @param { msg } 提示信息
     */
    Vue.prototype.vmMsgError = (msg: string = '操作失败！'): void => {
      vm.$message({
        showClose: true,
        message  : msg,
        type     : 'error',
      });
    };

    /**
     * 将日期时间转换成指定格式
     * 调用：dateFormat("yyyy-MM-dd hh:mm:ss")
     */
   /*  Vue.prototype.dateFormat = (date: Date, fmt: string) => {
      // 一季度3个月
      const MONTHS_PER_QUARTER = 3;
      interface O {
        'M+': number;
        'd+': number;
        'h+': number;
        'm+': number;
        's+': number;
        'q+': number;
        S: number;
        [key: string]: any;
      }
      const o: O = {
        // 月份
        'M+': date.getMonth() + 1,
        // 日
        'd+': date.getDate(),
        // 小时
        'h+': date.getHours(),
        // 分
        'm+': date.getMinutes(),
        // 秒
        's+': date.getSeconds(),
        // 季度
        'q+': Math.floor((date.getMonth() + MONTHS_PER_QUARTER) / MONTHS_PER_QUARTER),
        // 毫秒
        'S'   : date.getMilliseconds(),
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
      }
      for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
        }
      }
      return fmt;
    }; */
  },
};
