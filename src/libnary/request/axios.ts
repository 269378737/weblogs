import axios from 'axios';
import { Message } from 'element-ui';

interface HttpResponse {
  config: object;
  data: ServerResponse;
  headers: object;
  request: object;
  status: number;
  statusText: string;
}

interface ServerResponse {
  body: any;
  code: number;
  code_msg: string;
}


const instance = axios.create({
  timeout: 15000,
});

instance.interceptors.request.use((req) => {
  return req;
});

instance.interceptors.response.use((res) => {
  if (res.status === 500) {
    Message.error('服务器错误！');
    return Promise.resolve();
  }

  if (res.status === 200) {
    const { data } = res as HttpResponse;
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
  Message.error('获取数据失败！');
  return Promise.resolve();
}, (error) => {
  const { response } = error;
  if (response) {
    // 请求已发出，但是不在2xx的范围
    Message.error('请求数据失败！');
    return Promise.resolve();
  } else {
    // 处理断网的情况
    Message.error('服务器无响应！');
    return Promise.resolve();
  }
});

export default instance;
