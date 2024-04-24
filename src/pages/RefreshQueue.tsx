import {useCallback, useState} from 'react';
import http from '../utils/http';
import {Button, message, Select, Space} from 'antd';

const typeList = [
  'getDemonStockData',
  'downloadImg',
  'getMarketStockList',
  'getStockDailyData',
  'getDailyIndex',
  'getStockPanKouNarrow',
];

function RefreshQueue() {
  const [stateType, setStateType] = useState('');

  const requestRefresh = useCallback(async () => {
    if (!stateType) return;
    const params: any = {
      type: stateType,
    };
    const res: any = await http({
      method: 'POST',
      url: '/api/retry/queue',
      params,
    });
    if (res && res.code === 1) {
      message.info(res.message);
    }
  }, [stateType]);

  return (
    <Space wrap>
      <Select
        style={{width: 220}}
        onChange={value => {
          setStateType(value);
        }}
        options={typeList.map(item => ({value: item, label: item}))}
      />
      <Button type="primary" onClick={requestRefresh}>
        Retry
      </Button>
    </Space>
  );
}

export default RefreshQueue;
