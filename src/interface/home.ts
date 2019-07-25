export interface TreeNode {
  id: number;
  label: string;
  ip?: string;
}

export interface Log {
  content: string;
  create_time: number;
  device_id: string;
  level: number;
  user_id: number;
}

export interface LogResponse {
  logs: Log[];
  total: number;
}

export interface WebSocketOptions {
  deviceId: string;
  token: string;
  type: number;  // 1 实时, 2 查询
  event: string;
  logLevel: number;
  logType: number; // 通用 、app、sdk
}
export interface FormLogQuery {
  id_name: string;
  dateRange: string[];
  log_level: number;
  log_type: number;
  start_time: number;
  end_time: number;
  page: number;
  page_size: number;
}

/**
 * ID其所在服务器
 */
export interface DeviceIp {
  report_host: string;
}
