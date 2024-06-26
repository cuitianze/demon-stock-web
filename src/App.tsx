import {useState, useEffect} from 'react';
import './App.css';
import DemonStockList from './pages/DemonStockList';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import SelectStock from './pages/SelectStock';
import RefreshQueue from './pages/RefreshQueue';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DemonStockList />,
  },
  {
    path: '/select',
    element: <SelectStock />,
  },
  {
    path: '/refresh',
    element: <RefreshQueue />,
  },
]);

const RICH_PWD = 'RICH_PWD';

function App() {
  const [stateClickTimes, setStateClickTimes] = useState<number>(0);
  const [stateClearClickTimes, setStateClearClickTimes] = useState<number>(0);

  useEffect(() => {
    if (stateClearClickTimes >= 2) {
      localStorage.removeItem(RICH_PWD);
      window.location.reload();
    }
  }, [stateClearClickTimes]);

  return (
    <div className="App">
      {btoa(localStorage.getItem(RICH_PWD) || '') === 'U3VwZXJNYW5QS1la' ? (
        <RouterProvider router={router} />
      ) : (
        <div style={{textAlign: 'center'}}>
          <div
            onClick={() => {
              setStateClickTimes(stateClickTimes + 1);
            }}>
            404
          </div>
          {stateClickTimes >= 8 ? (
            <input
              type="password"
              placeholder="Password (confirm)"
              onBlur={e => {
                localStorage.setItem(RICH_PWD, 'SuperMan' + e.target.value);
                window.location.reload();
              }}
            />
          ) : null}
        </div>
      )}
      <div
        style={{
          width: '20px',
          height: '20px',
          position: 'fixed',
          right: 0,
          bottom: 0,
        }}
        onClick={() => {
          setStateClearClickTimes(stateClearClickTimes + 1);
        }}></div>
    </div>
  );
}

export default App;
