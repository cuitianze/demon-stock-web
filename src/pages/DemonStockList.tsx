import {useState, useEffect} from 'react';
import {DatePicker} from 'antd';
import type {DatePickerProps} from 'antd';
import {SheetComponent} from '@antv/s2-react';
import '@antv/s2-react/dist/style.min.css';
import http from '../utils/http';

const s2Options = {
  width: 2500,
  height: 1200,
  interaction: {
    linkFields: ['股票代码'],
  },
};

function DemonStockList() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [stateDate, setStateDate] = useState<string>();

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setStateDate(dateString);
  };

  useEffect(() => {
    if (!stateDate) return;
    http
      .get(`http://localhost:7001/api/stock_list?date=${stateDate}`)
      .then(data => {
        // handle success
        if (data instanceof Array) {
          setDataList(data);
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });

    return () => {};
  }, [stateDate]);

  const s2DataConfig = {
    fields: {
      rows: [
        '涨停原因',
        '涨停原因个股涨停个数',
        '股票名称',
        '股票代码',
        '板块',
        '连板数',
        '涨停时间_D',
        '融资融券',
        '回封',
        '振幅',
        '连板标签',
        '封单_D',
        '最大封单_D',
        '主力净额_D',
        '主力买入_D',
        '主力卖出_D',
        '成交额_D',
        '实际流通_D',
        '实际换手',
      ],
      //   columns: ['type'],
      values: ['-'],
    },
    meta: [
      {
        field: '涨停原因',
        name: '涨停原因',
      },
      {
        field: '涨停原因个股涨停个数',
        name: '涨停数',
      },
      {
        field: '股票代码',
        name: '股票代码',
      },
      {
        field: '板块',
        name: '板块',
      },
      {
        field: '连板数',
        name: '连板数',
      },
      {
        field: '融资融券',
        name: '融资融券',
        formatter: (value: any) => {
          return value === '1' ? '是' : '';
        },
      },
      {
        field: '涨停时间_D',
        name: '涨停时间',
        formatter: (value: any) => {
          return value.split(' ')[1];
        },
      },
      {
        field: '回封',
        name: '回封',
        formatter: (value: any) => {
          return value === '1' ? '是' : '';
        },
      },
      {
        field: '振幅',
        name: '振幅',
      },
      {
        field: '连板标签',
        name: '连板标签',
      },
      {
        field: '封单_D',
        name: '封单',
      },
      {
        field: '最大封单_D',
        name: '最大封单',
      },
      {
        field: '主力净额_D',
        name: '主力净额',
      },
      {
        field: '主力买入_D',
        name: '主力买入',
      },
      {
        field: '主力卖出_D',
        name: '主力卖出',
      },
      {
        field: '成交额_D',
        name: '成交额',
      },
      {
        field: '实际流通_D',
        name: '实际流通',
      },
      {
        field: '实际换手',
        name: '实际换手',
        formatter: (value: any) => {
          return `${value}%`;
        },
      },
    ],
    data: dataList,
  };

  return (
    <div
      style={{
        paddingTop: '32px',
      }}>
      <div
        style={{
          height: '32px',
          lineHeight: '32px',
          paddingBottom: '2px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 888,
        }}>
        <DatePicker onChange={onDateChange} />
        &nbsp; 涨停数: {dataList.length}
      </div>
      <div>
        <SheetComponent
          dataCfg={s2DataConfig}
          options={s2Options}
          themeCfg={{
            theme: {
              rowCell: {
                text: {
                  textAlign: 'right',
                },
                bolderText: {
                  textAlign: 'right',
                },
              },
            },
          }}
          onLinkFieldJump={data => {
            const code = data.record['股票代码'];
            window.open(`http://stockpage.10jqka.com.cn/${code}`);
          }}
        />
      </div>
    </div>
  );
}

export default DemonStockList;
