import {useCallback, useEffect, useRef, useState} from 'react';
import http from '../utils/http';
import {DatePicker, Switch} from 'antd';
import loadingUrl from '../static/loading.png';

const {RangePicker} = DatePicker;

// 日K
const img_url = '//image.sinajs.cn/newchart/daily/n/';
// 月K
// const monthly_img_url = '//image.sinajs.cn/newchart/weekly/n/';

const LazyLoadImage = ({src, alt}: {src: string; alt: string}) => {
  const [imageSrc, setImageSrc] = useState(loadingUrl);
  const imgRef = useRef(null as any);

  useEffect(() => {
    let observer: IntersectionObserver;
    if (imgRef.current) {
      // 创建IntersectionObserver实例
      observer = new IntersectionObserver(
        ([entry]) => {
          // 当图片进入可视区域时，设置图片地址进行加载
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imgRef.current);
          }
        },
        {
          rootMargin: '0px 0px 200px 0px', // 可视区域的上边距设置为200px
        },
      );
      observer.observe(imgRef.current); //开始观察目标元素
    }
    return () => {
      //   if (observer && observer.unobserve) {
      //     observer.unobserve(imgRef.current);
      //   }
    };
  }, [src]);

  return (
    <img
      style={{width: '100%', height: '100%'}}
      ref={imgRef}
      src={imageSrc}
      alt={alt}
    />
  );
};

function SelectStock() {
  const [stateStockList, setStateStockList] = useState<Array<unknown>>([]);
  const [stateCount, setStateCount] = useState<number>(0);

  const [stateDateRange, setStateDateRange] = useState<Array<unknown>>([0, 0]);
  const [stateIsRise, setStateIsRise] = useState<Boolean>(true);
  const [stateIsMoreThanAvg, setStateIsMoreThanAvg] = useState<Boolean>(true);

  const requestSelectStock = useCallback(async () => {
    if (!stateDateRange[0]) return;
    const params: any = {
      date: stateDateRange,
      isRise: stateIsRise,
      isMoreThanAvg: stateIsMoreThanAvg,
      type: 'king',
      //   px_change_rate: [0, 3],
    };
    const res = await http.post('/api/select_stock', params);
    if (res && res.data) {
      const list = res.data[0];
      setStateStockList(list);
      setStateCount(res.data[1]);
    } else {
      setStateStockList([]);
      setStateCount(0);
    }
  }, [stateDateRange, stateIsMoreThanAvg, stateIsRise]);

  useEffect(() => {
    requestSelectStock();
  }, [requestSelectStock]);

  return (
    <div>
      <div style={{position: 'sticky', top: 0}}>
        <RangePicker
          onChange={(dates, dateString) => {
            if (dates && dateString) {
              setStateDateRange(dateString);
            }
          }}
        />
        <Switch
          checkedChildren="主升"
          unCheckedChildren="全部"
          defaultChecked
          onChange={checked => {
            setStateIsRise(checked);
          }}
        />
        <Switch
          checkedChildren="主买"
          unCheckedChildren="全部"
          defaultChecked
          onChange={checked => {
            setStateIsMoreThanAvg(checked);
          }}
        />
        <span style={{float: 'right'}}>{stateCount}</span>
      </div>

      <div>
        {stateStockList.map((stock: any) => {
          const full_code = (/^6/.test(stock.code) ? 'sh' : 'sz') + stock.code;
          const stock_img = img_url + full_code + '.gif';
          const stock_url = `https://quote.eastmoney.com/${full_code}.html`;
          return (
            <div
              style={{
                display: 'inline-block',
                width: '24%',
                margin: '4px',
              }}>
              <span>
                {stock.name} ({stock.code})
              </span>
              <a
                key={stock.code}
                href={stock_url}
                target="_blank"
                rel="noreferrer">
                <LazyLoadImage src={stock_img} alt={stock.name} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SelectStock;
