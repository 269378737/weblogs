export interface TreeNode {
  id: number;
  label: string;
}

export interface LogLevelList {
  id: number;
  name: string;
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
