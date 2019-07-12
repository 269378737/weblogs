<template>
  <div class="flex">
    <el-row class="flex">
      <!-- 右侧列表 -->
      <el-col :span="4" class="iot-lists">
        <el-input
          class="iot-lists-filter"
          placeholder="输入关键字进行过滤"
          v-model="filterText"
        >
          <el-button
            slot="append"
            icon="el-icon-plus"
            style="padding: 12px 10px"
            @click="onDeviceIdStorage"
          ></el-button>
        </el-input>

        <el-tree
          :data="data"
          :props="defaultProps"
          :highlight-current="true"
          :filter-node-method="filterNode"
          ref="tree"
        >
          <span class="tree-content" slot-scope="{ node, data }">
            <span class="tree-label" @click="onDeviceIdClick(node.label)">{{ node.label }}</span>
            <i
              v-if="data.id !== 0"
              class="el-icon-delete"
              style="margin-left:12px"
              @click="() => onRemoveDeviceID(node, data)"
            ></i>
          </span>
        </el-tree>
      </el-col>

      <!-- 左侧日志-->
      <el-col :span="20" class="logs-lists">
        <!-- 搜索查询 -->
        <div class="search">
          <el-form :inline="true" :model="form" class="demo-form-inline">
            <el-form-item>
              <el-select v-model="logMode">
                <el-option label="实时" value="0"></el-option>
                <el-option label="时间段" value="1"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="form.log_level"
                placeholder="请选择日志等级">
                <el-option
                  v-for="(item, index) in logLevelLists"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="form.log_type">
                <el-option label="All" :value="10"></el-option>
                <el-option label="通用" :value="0"></el-option>
                <el-option label="SDK日志" :value="1"></el-option>
                <el-option label="固件/app日志" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled="isDisabled">
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit(queryWay.click)" :disabled="isDisabled">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onClearScreen">清屏</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onPause" :disabled="!isDisabled">{{ isPause ? "继续" : "暂停"}}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 日志黑板 -->
        <div class="logs">
          <div class="logs-container" id="logs">
            <!--  <p class="log-detail ">
              <span class="log-title warning">[2019-06-12 12:33:12][WARN]：</span>
              <span class="log-content">The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.</span>
            </p> -->
            <!--<p class="log-detail">
              <span class="log-title error">[2019-06-12 12:33:12][ERROR]：</span>
              <span class="log-content">Stopping app:blog-back id:0</span>
            </p>
            <p class="log-detail ">
              <span class="log-title fatal">[2019-06-12 12:33:12][FATAL]：</span>
              <span class="log-content">Stopping app:blog-back id:0</span>
            </p>
            <p class="log-detail ">
              <span class="log-title debug">[2019-06-12 12:33:12][DEBUG]：</span>
              <span class="log-content">Stopping app:blog-back id:0</span>
            </p>
            <p class="log-detail">
              <span class="log-title info">[2019-06-12 12:33:12][INFO]：</span>
              <span class="log-content">Stopping app:blog-back id:0</span>
            </p> -->
            <!--  <p class="log-detail" v-for="(item, index) in logs" :key="index">{{item}}</p> -->
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { ElTree } from 'element-ui/types/tree';
import { TreeNode, LogResponse, WebSocketOptions, FormLogQuery } from '@/interface/home';
import { SelectList } from '@/interface/util';
import { LogLevel } from '@/enum/enum';

const token: string = 'mktech2018';
const evt: string = '/iot/logRep';
const wsUrl: string = 'ws://120.79.178.33:30570/ws';

@Component
export default class Home extends Vue {
  /* data */
  private ws: WebSocket | null = null;
  private filterText: string = '';
  private isDisabled: boolean = true;
  private logsDiv: HTMLElement | null = null;
  private logMode: string = '0';
  private data: TreeNode[] = [{
    id: 0,
    label: 'All devices',
  }];
  // 是否正在查询日志数据
  private isGetting: boolean = false;
  // 标识是点击按钮查询还是滚动鼠标翻页查询
  private queryWay = {
    click: 0,
    page: 1,
  };
  // 从实时转为查询时，只有在点击一次查询按钮后才能实现滚动翻页查询
  private isQueryButtonClicked: boolean = false;
  // 是否暂停了实时日志
  private isPause: boolean = false;
  private wsParams: WebSocketOptions = {
    deviceId: '',
    token,
    type: 1,
    event: evt,
    logLevel: 4,
    logType: 0,
  };

  private defaultProps = {
    children: 'children',
    label: 'label',
  };
  private form: FormLogQuery = {
    id_name: '',
    dateRange: [],
    log_level: 4,
    log_type: 10,
    start_time: 0,
    end_time: 0,
    page: 1,
    page_size: 100,
  };

  /* computed */
  get logLevelLists(): SelectList[] {
    return this.$util.vmSelectCompute(LogLevel);
  }

  @Ref('tree') private readonly tree!: ElTree;

  /* watch */
  @Watch('filterText')
  private onFilterTextChanged(val: string) {
    this.tree.filter(val);
  }

  @Watch('logMode')
  private onLogModelChanged(val: string) {
    if (val === '0') {
      this.openSocket();
      this.isDisabled = true;
      this.isPause = false;
      this.isQueryButtonClicked = false;
    } else {
      this.isDisabled = false;
      this.isPause = true;
      if (this.ws) { this.ws.close(); }
      this.ws = null;
    }
  }

  @Watch('form.log_level')
  private onLogLevelChanged(val: number) {
    // 切换查询条件后应该将页码置为1
    this.form.page = 1;
    if (this.logMode === '0') {
      this.wsParams.logLevel = val;
      this.openSocket();
      this.isPause = false;
    }
  }

  @Watch('form.log_type')
  private onLogTypeChanged(val: string) {
    // 切换查询条件后应该将页码置为1
    this.form.page = 1;
    if (this.logMode === '0') {
      this.wsParams.logType = Number(val);
      this.openSocket();
      this.isPause = false;
    }
  }
  @Watch('form.dateRange')
  private onDateChanged(val: string[]) {
    // 切换查询条件后应该将页码置为1
    this.form.page = 1;
  }

  /* lifecycle */
  private created(): void {
    const deviceLists = localStorage.getItem('deviceLists');
    if (!deviceLists) { return; }
    this.data = JSON.parse(deviceLists);
  }

  private mounted(): void {
    this.logsDiv = document.getElementById('logs');
    this.scrollToBottom();
    this.openSocket();

    /** 日志滚动翻页 */
    // FireFox
    this.logsDiv!.addEventListener('DOMMouseScroll', (event: Event) => {
      if (this.isDisabled || !this.isQueryButtonClicked) { return; }
      this.getLogsByPage(event);
    });
    // Chrome
    this.logsDiv!.addEventListener('mousewheel', (event: Event) => {
      if (this.isDisabled || !this.isQueryButtonClicked) { return; }
      this.getLogsByPage(event);
    });
  }

  /* methods */
  private getLogsByPage(event: Event): void {
    const e = event as WheelEvent;
    // 可能会实现向上滚动翻页的功能，因此不要将两个if语句合并成一句
    if (e.deltaY) { // 判断浏览器IE，谷歌滑轮事件
      if (e.deltaY > 0) { // 当滑轮向下滚动时
        this.downScroll();
      }
    } else if (e.detail) {  // Firefox滑轮事件
      if (e.detail < 0) { // 当滑轮向下滚动时
        this.downScroll();
      }
    }
  }

  /** 鼠标向下滚动时，到底部获取日志数据 */
  private downScroll(): void {
    const isToBottom = this.logsDiv!.scrollHeight - (this.logsDiv!.scrollTop + this.logsDiv!.clientHeight);
    if (isToBottom < 500 && !this.isGetting) {
      this.form.page += 1;
      this.onSubmit(this.queryWay.page);
    }
  }

  private createSocket(): void {
    this.ws = new WebSocket(wsUrl);
    this.createLogRender('connecting socket server, please waiting...');
    this.ws.onopen = () => {
      this.createLogRender('socket server connected, start receive data...');
      this.checkAndSend();
    };

    this.ws.onmessage = (event) => {
      this.createLogRender(event.data);

      const timer = setTimeout(() => {
        this.scrollToBottom();
        clearTimeout(timer);
      });
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.isPause) {
        this.createLogRender('socket server pause...');
      } else {
        this.createLogRender('socket server closed...');
      }
      this.scrollToBottom();
    };
    this.ws.onerror = () => {
      this.createLogRender('connect socket server failed...');
    };
  }

  private openSocket(): void {
    if (!this.ws) {
      return this.createSocket();
    }
    this.checkAndSend();
  }

  private createLogRender(data: string): void {
    const log = document.createElement('P');
    log.classList.add('log-detail');
    log.innerHTML = data;

    this.logsDiv!.append(log);
    // 在实时查看日志的情况下，页面只保留一千条数据；查询情况下，不限
    if (this.logsDiv!.children.length > 1000 && this.ws) {
      this.logsDiv!.removeChild(this.logsDiv!.children[0]);
    }
  }

  // 暂停实时日志
  private onPause(): void {
    if (this.isPause) {
      this.isPause = false;
      this.openSocket();
    } else {
      this.isPause = true;
      if (this.ws) { this.ws.close(); }
      this.ws = null;
    }
  }

  // 清屏
  private onClearScreen(): void {
    this.logsDiv!.innerHTML = '';
    this.logsDiv!.scrollTop = 0;
  }

  private checkAndSend(): void {
    if (this.ws!.readyState === WebSocket.CONNECTING) {
      this.createLogRender('connecting socket server, please waiting...');
      return;
    }
    if (this.logMode === '0') {
      this.ws!.send(JSON.stringify(this.wsParams));
    }
  }

  private scrollToBottom(): void {
    this.logsDiv!.scrollTop = this.logsDiv!.scrollHeight;
  }

  private onRemoveDeviceID(node: Node, data: TreeNode): void {
    this.$confirm(`确定删除设备ID【${data.label}】吗？`, '提示', {
      type: 'warning',
    }).then(() => {
      const temp = this.data.find((o: TreeNode) => o.id === data.id);
      if (temp) {
        this.data.splice(this.data.indexOf(temp), 1);
        localStorage.setItem('deviceLists', JSON.stringify(this.data));
      }
    }).catch( (e) => {
      if (e !== 'cancel') {
        this.createLogRender('删除失败！');
      }
    });
  }

  private onDeviceIdStorage(): void {
    if (!this.filterText) { return; }
    const newDeviceId: TreeNode = {
      id: this.data.length,
      label: this.filterText,
    };

    // 检测是否已经存在
    const isHas = this.data.find((o) => o.label === this.filterText);
    if (isHas) {
      this.filterText = '';
      return this.$util.vmMsgWarning('设备ID已存在！');
    }

    this.data.push(newDeviceId as never);
    this.filterText = '';
    localStorage.setItem('deviceLists', JSON.stringify(this.data));
  }

  private filterNode(value: string, data: TreeNode): boolean {
    if (!value) { return true; }
    return data.label.indexOf(value) !== -1;
  }

  private onDeviceIdClick(deviceId: string): void {
    this.wsParams.deviceId = deviceId === 'All devices' ? '' : deviceId;
    this.form.id_name = deviceId === 'All devices' ? '' : deviceId;
    this.form.page = 1;
    // 如果选择设备ID时不是实时状态，则不打开socket
    if (!this.isDisabled) { return; }
    this.openSocket();
    this.isPause = false;
  }

  private async onSubmit(flag: number) {
    this.isQueryButtonClicked = true;
    if (this.form.dateRange && this.form.dateRange.length > 0) {
      this.form.start_time = new Date(this.form.dateRange[0]).getTime() / 1000;
      this.form.end_time = new Date(this.form.dateRange[1]).getTime() / 1000;
    } else {
      this.form.start_time = 0;
      this.form.end_time = 0;
    }
    this.isGetting = true;
    this.$util.vmOpenFullLoading();
    const res: LogResponse = await this.$http.post('/v2/iotlog/getlog', this.form);
    this.$util.vmCloseFullLoading();
    if (!res) { return; }
    const { logs } = res;
    if (!logs) {
      this.$util.vmMsgWarning('无数据');
      // 如果未查找到数据，则保持当前页码，以便下次有数据时能从当前页继续查找
      if (this.form.page > 1) { this.form.page -= 1; } return;
    }
    // 在每次点击按钮查询时清空日志黑板
    if (flag === this.queryWay.click) {
      this.onClearScreen();
    }

    logs.forEach((item) => {
        /* const str = `
        [${this.dateFormat(new Date(item.create_time * 1000), 'yyyy-MM-dd hh:mm:ss')}]
        [${LogLevel[item.level]}]：${item.content}`; */

      this.createLogRender(item.content);
    });

    this.isGetting = false;
  }
}
</script>

<style lang="scss" scoped>
$input-width: 200px;
$select-width: 130px;
$bg-color: #409eff;
$bg-font-color: #fff;

.el-input {
  width: $input-width;
}
.el-select {
  width: $select-width;
}

.iot-lists-filter {
  margin-top: 20px;
}

.el-tree {
  margin-top: 20px;
  /deep/ .el-tree-node__content {
    height: 36px;
  }
  /deep/ .el-tree-node.is-current {
    > .el-tree-node__content {
      background-color: $bg-color;
      color: $bg-font-color;
    }
  }
  .tree-content {
    margin-left: -10px;
    font-size: 12px;
    width: 90%;
    height: 100%;
    display: flex;
    align-items: center;
    .tree-label {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
}

.iot-lists {
  border: 1px solid #939393;
  text-align: center;
  min-width: 220px;
  overflow-y: scroll;
}

.logs-lists {
  padding-left: 20px;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  flex-direction: column;
  .logs {
    background: #f1f1f1;
    color: #583333;
    height: 93%;
    .logs-container {
      overflow-y: scroll;
      height: 100%;
    }
    /deep/ .log-detail {
      margin: 10px 20px;
    }
  }
}
</style>


<style scoped>
/* .logs-lists .logs .log-detail span {
  display: table-cell;
}
.logs-lists .logs .log-detail .log-title {
  min-width: 250px;
}
.logs-lists .logs .log-detail .log-content {
  line-height: 1.8;
  word-break: normal;
}

.logs-lists .logs .log-detail .debug {
  color: #009aff;
}

.logs-lists .logs .log-detail .info {
  color: #939393;
}

.logs-lists .logs .log-detail .warning {
  color: #e9d512;
}

.logs-lists .logs .log-detail .error {
  color: #e30404;
}

.logs-lists .logs .log-detail .fatal {
  color: #b65cff;
} */
</style>