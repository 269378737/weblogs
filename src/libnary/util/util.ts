import { Message, Loading } from 'element-ui';
import { ElLoadingComponent } from 'element-ui/types/loading';
import { SelectList } from '@/interface/util';

export interface IUtil {
  vmMsgSuccess(msg: string): void;
  vmMsgWarning(msg: string): void;
  vmMsgError(msg: string): void;
  vmOpenFullLoading(msg?: string): void;
  vmCloseFullLoading(): void;
  vmSelectCompute(enumArgs: object): SelectList[];
}

class Utils implements IUtil {
  private loading: ElLoadingComponent | null = null;

  public vmMsgError = (msg: string = '操作失败！'): void => {
    Message({
      showClose: true,
      message  : msg,
      type     : 'error',
    });
  }

  public vmMsgSuccess = (msg: string = '操作成功！'): void => {
    Message({
      showClose: true,
      message  : msg,
      type     : 'success',
    });
  }

  public vmMsgWarning = (msg: string = '无法进行当前操作！'): void => {
    Message({
      showClose: true,
      message  : msg,
      type     : 'warning',
    });
  }

  public vmOpenFullLoading = (msg: string = '处理中，请稍后...'): void => {
    this.loading = Loading.service({
      lock      : true,
      text      : msg,
      background: 'rgba(234, 234, 234, 0.86)',
    });
  }

  public vmCloseFullLoading = (): void => {
    this.loading!.close();
  }

  public vmSelectCompute(enumArgs: object): SelectList[] {
    const arr: SelectList[] = [];
    let keys = Object.keys(enumArgs);
    keys = keys.slice(keys.length / 2);
    keys.forEach((item: string) => {
      arr.push({
        id: enumArgs[item as keyof typeof enumArgs],
        name: item,
      });
    });
    return arr;
  }
}


export default new Utils();
