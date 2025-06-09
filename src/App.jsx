import React, { useState, useEffect } from 'react';
import MainScreen from './components/MainScreen';
import IndoorMap from './components/IndoorMap';
import './App.css';

// 백엔드 API 기본 URL
const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [nodes, setNodes] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [path, setPath] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // 컴포넌트가 마운트될 때 백엔드에서 모든 노드 정보를 가져옵니다.
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/nodes/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // 배열을 node_id를 키로 하는 객체로 변환하여 쉽게 찾을 수 있도록 합니다.
        const nodesObject = data.reduce((acc, node) => {
            acc[node.node_id] = node;
            return acc;
        }, {});
        setNodes(nodesObject);
        setError('');
      } catch (e) {
        console.error("Failed to fetch nodes:", e);
        setError('지도 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  // 목적지 선택을 처리하는 함수
  const handleDestinationSelect = async (destinationId) => {
      if (!currentLocation) {
          setError("현재 위치를 먼저 설정해주세요.");
          return;
      }
      if (currentLocation.node_id === destinationId) {
          setError("현재 위치와 목적지는 같을 수 없습니다.");
          setPath([]); // 경로 초기화
          setDestination(nodes[destinationId]);
          return;
      }
      
      const selectedDestination = nodes[destinationId];
      setDestination(selectedDestination);

      // 경로 탐색 API 호출
      try {
          const response = await fetch(`${API_URL}/pathfind/?start=${currentLocation.node_id}&end=${destinationId}`);
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || '경로를 찾는 데 실패했습니다.');
          }
          const result = await response.json();
          if (result.path) {
              // API로부터 받은 경로는 ID 목록이므로, 전체 노드 객체로 매핑합니다.
              const detailedPath = result.path.map(id => nodes[id]);
              setPath(detailedPath);
              setError('');
          } else {
              throw new Error(result.error || '경로를 찾을 수 없습니다.');
          }
      } catch (e) {
          console.error("Pathfinding error:", e);
          setError(`경로 탐색 오류: ${e.message}`);
          setPath([]); // 오류 발생 시 경로 초기화
      }
  };
  
  // QR 코드 스캔을 시뮬레이션하는 함수
  const handleScanSimulation = (nodeId) => {
      const locationNode = nodes[nodeId];
      if (locationNode) {
          setCurrentLocation(locationNode);
          setError('');
          // 목적지가 이미 설정된 경우, 경로를 다시 계산합니다.
          if (destination) {
              handleDestinationSelect(destination.node_id);
          }
      } else {
          setError(`ID가 ${nodeId}인 노드를 찾을 수 없습니다.`);
      }
  };
  
  if (loading) {
      return <div>지도를 불러오는 중...</div>;
  }
  
  if (error && Object.keys(nodes).length === 0) {
      return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      { !currentLocation ? (
        <div className="location-prompt">
           <h2>QR 코드를 스캔하여 현재 위치를 설정하세요.</h2>
           <p>데모를 위해 아래 버튼을 클릭하여 스캔을 시뮬레이션할 수 있습니다.</p>
           {Object.keys(nodes).length > 0 ? (
            <div>
              <button onClick={() => handleScanSimulation('101')}>현재 위치: 로비 (101)</button>
              <button onClick={() => handleScanSimulation('105')}>현재 위치: 회의실 A (105)</button>
            </div>
           ) : <p>위치 정보를 불러올 수 없습니다.</p> }
           {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <>
          <MainScreen
            nodes={Object.values(nodes)}
            onDestinationSelect={handleDestinationSelect}
            currentLocation={currentLocation}
            destination={destination}
          />
          {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}
          <IndoorMap
            nodes={Object.values(nodes)}
            path={path}
            currentLocation={currentLocation}
            destination={destination}
          />
        </>
      )}
    </div>
  );
}

export default App;
