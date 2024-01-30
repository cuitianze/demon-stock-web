import {useState, useEffect} from 'react';
import {Checkbox, DatePicker, Input} from 'antd';
import type {DatePickerProps, GetProp} from 'antd';
import {SheetComponent} from '@antv/s2-react';
import '@antv/s2-react/dist/style.min.css';
import dayjs from 'dayjs';
import http from '../utils/http';
import {SearchProps} from 'antd/lib/input';

const {Search} = Input;

// date 代表指定的日期，格式：2018-09-27
// day 传-1表始前一天，传1表始后一天
// JS获取指定日期的前一天，后一天
const getNextDate = (date: string, day: number) => {
  const dd = new Date(date);
  dd.setDate(dd.getDate() + day);
  const y = dd.getFullYear();
  const m =
    dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1;
  const d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate();
  return y + '-' + m + '-' + d;
};

function DemonStockList() {
  const [filterDataList, setFilterDataList] = useState<any[]>([]);
  const [stateFilterOptions, setStateFilterOptions] = useState<number[]>(
    JSON.parse(localStorage.getItem('stateFilterOptions') || '[]'),
  );
  const [stateFilterSearch, setStateFilterSearch] = useState<string>('');
  const [stateDate, setStateDate] = useState<string>();
  const [stateDataList, setStateDataList] = useState<any[]>([]);
  const [stateCompareDate, setStateCompareDate] = useState<string>();
  const [stateCompareDataList, setStateCompareDataList] = useState<any[]>([]);
  const [stateCompareStockCodeList, setStateCompareStockCodeList] = useState<
    string[]
  >([]);
  const [stateCompareStockNameList, setStateCompareStockNameList] = useState<
    string[]
  >([]);

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setStateDate(dateString);
  };
  const onCompareDateChange: DatePickerProps['onChange'] = (
    date,
    dateString,
  ) => {
    setStateCompareDate(dateString);
  };

  const onFilterChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues: any[],
  ) => {
    setStateFilterOptions(checkedValues);
    localStorage.setItem('stateFilterOptions', JSON.stringify(checkedValues));
  };

  useEffect(() => {
    if (localStorage.getItem('stateFilterOptions')) {
      setStateFilterOptions(
        JSON.parse(localStorage.getItem('stateFilterOptions') || '[]'),
      );
    }
  }, []);

  useEffect(() => {
    if (!stateDate) return;
    http
      .get(`/api/stock_list?date=${stateDate}`)
      .then(data => {
        // handle success
        if (data instanceof Array) {
          setStateDataList(data);
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

  useEffect(() => {
    if (!stateCompareDate) return;
    http
      .get(`/api/stock_list?date=${stateCompareDate}`)
      .then(data => {
        // handle success
        if (data instanceof Array) {
          setStateCompareDataList(data);
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
  }, [stateCompareDate]);

  // 数据过滤条件
  useEffect(() => {
    // 如果直接搜索某只股票，就不管其他条件
    if (stateFilterSearch) {
      setFilterDataList(
        stateDataList.filter(item =>
          item['股票名称'].includes(stateFilterSearch),
        ),
      );
      return;
    }
    setFilterDataList(
      stateDataList.filter(item => {
        if (!stateFilterOptions.length) return true;
        if (item['连板数'] >= 6) {
          return stateFilterOptions.includes(6);
        }
        return stateFilterOptions.includes(item['连板数']);
      }),
    );
  }, [stateDataList, stateFilterOptions, stateFilterSearch]);

  // 对比数据
  useEffect(() => {
    if (
      !stateDataList.length ||
      !stateCompareDataList.length ||
      JSON.stringify(stateDataList) === JSON.stringify(stateCompareDataList)
    ) {
      setStateCompareStockCodeList([]);
      setStateCompareStockNameList([]);
      return;
    }
    const compareStockCodeList: string[] = [];
    const compareStockNameList: string[] = [];
    stateCompareDataList.forEach(compareDataItem => {
      compareStockCodeList.push(compareDataItem['股票代码']);
      compareStockNameList.push(compareDataItem['股票名称']);
    });
    setStateCompareStockCodeList(compareStockCodeList);
    setStateCompareStockNameList(compareStockNameList);
  }, [stateDataList, stateCompareDataList]);

  const numberOptions = [
    {label: '1板', value: 1},
    {label: '2板', value: 2},
    {label: '3板', value: 3},
    {label: '4板', value: 4},
    {label: '5板', value: 5},
    {label: '6板及以上', value: 6},
  ];

  const s2Options = {
    width: 2500,
    height: 1200,
    showTooltip: true,
    interaction: {
      linkFields: ['股票代码'],
      hoverHighlight: true,
    },
    conditions: {
      text: [
        {
          field: '股票名称',
          mapping: (value: any, record: any) => {
            if (!stateCompareDataList.length) return;
            if (!record || !record.query) return;
            if (!stateCompareStockNameList.length) return;
            if (stateCompareStockNameList.includes(record.query['股票名称'])) {
              return {
                fill: 'red',
              };
            } else {
              return {
                fill: 'green',
              };
            }
          },
        },
      ],
      background: [
        {
          field: new RegExp(
            '股票名称|股票代码|板块|连板数|涨停时间_D|融资融券|回封|振幅|连板标签|封单_D|最大封单_D|主力净额_D|主力买入_D|主力卖出|主力卖出_D|成交额_D|实际流通_D|实际换手',
          ),
          mapping(value: any, record: any) {
            if (!record) return;
            if (record['股票代码'] && stateCompareStockCodeList.length) {
              if (!stateCompareStockCodeList.includes(record['股票代码'])) {
                return {
                  fill: '#e3f1e5',
                };
              }
            }
            if (record && record['股票代码']) {
              if (
                Number(record['回封']) === 1 ||
                Number(record['主力卖出']) < -50000000
              ) {
                return {
                  fill: '#eefbbe',
                };
              } else {
                if (stateCompareStockCodeList.length) {
                  return {
                    fill: '#f8dddd',
                  };
                }
              }
            }
          },
        },
      ],
    },
  };

  const s2DataConfig = {
    fields: {
      rows: ['涨停原因', '涨停原因个股涨停个数', '股票名称'],
      // columns: ['type'],
      values: [
        '股票代码',
        '涨停时间_D',
        '板块',
        '连板数',
        '连板标签',
        '融资融券',
        '回封',
        '主力卖出',
        '主力卖出_D',
        '主力买入_D',
        '振幅',
        '封单_D',
        '最大封单_D',
        '主力净额_D',
        '成交额_D',
        '实际流通_D',
        '实际换手',
      ],
    },
    meta: [
      {
        field: '涨停原因个股涨停个数',
        name: '涨停数',
      },
      {
        field: '融资融券',
        name: '融资融券',
        formatter: (value: any) => {
          return value === 1 ? '是' : '';
        },
      },
      {
        field: '涨停时间_D',
        name: '涨停时间',
        formatter: (value: any) => {
          return value && value.split(' ')[1];
        },
      },
      {
        field: '回封',
        name: '回封',
        formatter: (value: any) => {
          return value === 1 ? '是' : '';
        },
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
        name: '主力卖出_D',
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
          return value ? `${value}%` : '';
        },
      },
    ],
    data: filterDataList,
  };

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    setStateFilterSearch(value);
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
        <DatePicker
          value={stateDate ? dayjs(stateDate, 'YYYY-MM-DD') : dayjs(new Date())}
          onChange={onDateChange}
        />
        &nbsp;
        <Checkbox.Group
          options={numberOptions}
          defaultValue={stateFilterOptions}
          onChange={onFilterChange}
        />
        涨停数：{filterDataList.length}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '60%',
          }}>
          <span
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              if (stateDate) {
                setStateDate(getNextDate(stateDate, -1));
              }
              if (stateCompareDate) {
                setStateCompareDate(getNextDate(stateCompareDate, -1));
              }
            }}>
            前一天
          </span>
          &nbsp; | &nbsp;
          <span
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              if (stateDate) {
                setStateDate(getNextDate(stateDate, 1));
              }
              if (stateCompareDate) {
                setStateCompareDate(getNextDate(stateCompareDate, 1));
              }
            }}>
            后一天
          </span>
        </div>
        <div
          style={{
            float: 'right',
          }}>
          <Search
            placeholder="stock name"
            onSearch={onSearch}
            style={{width: 200}}
          />
          &nbsp;
          <span>对比日期：</span>
          <DatePicker
            value={
              stateCompareDate
                ? dayjs(stateCompareDate, 'YYYY-MM-DD')
                : dayjs(new Date())
            }
            onChange={onCompareDateChange}
          />
        </div>
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
              // 数值单元格 (其他单元格同理)
              dataCell: {
                cell: {
                  interactionState: {
                    // 悬停聚焦: 关闭悬停单元格时出现的 "黑色边框"
                    hoverFocus: {
                      borderColor: 'transparent',
                    },
                    // 十字悬停
                    hover: {
                      backgroundColor: 'orange',
                      backgroundOpacity: 0.5,
                      borderColor: 'transparent',
                      borderOpacity: 1,
                    },
                    // 选中背景色/边框
                    selected: {
                      backgroundColor: '#ffb764',
                      borderColor: '#000',
                      borderWidth: 1,
                    },
                    // 未选中背景色/边框
                    unselected: {
                      backgroundOpacity: 0.5,
                      textOpacity: 0.1,
                      opacity: 0,
                    },
                  },
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
