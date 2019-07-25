import axios from 'axios';
import { Message, Loading } from 'element-ui';
import { ElLoadingComponent } from 'element-ui/types/loading';

/**
 * axios 返回格式
 */
interface IHttpResponse {
  config: object;
  data: IServerResponse;
  headers: object;
  request: object;
  status: number;
  statusText: string;
}

/**
 * 与后台约定格式
 */
interface IServerResponse {
  body: any;
  code: number;
  code_msg: string;
}

let loading: ElLoadingComponent | null = null;

const instance = axios.create({
  timeout: 15000,
});

instance.interceptors.request.use((req) => {
  const { params } = req;
  // 默认开启loading，如果某些接口不需要则传入 noLoading 参数，且设置值为 true
  if (!params || !params.noLoading) {
    loading = Loading.service({
      lock      : true,
      text      : `处理中，请稍后...`,
      background: 'rgba(234, 234, 234, 0.86)',
    });
  } else {
    // 设置了 noLoading，再发出请求时删除该参数
    delete params.noLoading;
  }
  return req;
});

instance.interceptors.response.use((res) => {
  if (loading) { loading.close(); }
  if (res.status === 200) {
    const { data } = res as IHttpResponse;
    const {body, code, code_msg} = data;
    if (code !== 0) {
      Message.error(code_msg);
      return Promise.resolve();
    } else if (!body || (body instanceof Array && body.length === 0) ||
              (body instanceof Object && Object.keys(body).length === 0)) {
      Message.warning('无数据！');
      return Promise.resolve();
    }
    return Promise.resolve(body);
  }

  const { status } = res;
  switch (status) {
    case 500:
      Message.error('服务器错误！'); break;
    default:
      Message.error('获取数据失败！'); break;
  }
  return Promise.resolve();
}, (error) => {
  if (loading) { loading.close(); }
  const response: IHttpResponse = error.response;
  if (response) {
    const { status } = response;
    switch (status) {
      case 404:
        Message.error('接口不存在！'); break;
      default:
        Message.error('接口调用出错！'); break;
    }
    return Promise.resolve();
  } else {
    Message.error('服务器无响应！');
    return Promise.resolve();
  }
});

export default instance;
