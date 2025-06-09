// src/components/IndoorMap.jsx
import React, { useState, useEffect } from 'react';
import { floorData, getPlaceById } from '../floorData';

const IndoorMap = ({ selectedFloor, currentLoc }) => {
  const [startPointId, setStartPointId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [route, setRoute] = useState(null);

  const currentFloorData = floorData[selectedFloor];

  // currentLoc이 변경되면 출발지로 자동 설정합니다.
  useEffect(() => {
    if (currentLoc) {
      setStartPointId(currentLoc);
    }
    // 층이 바뀌면 경로를 초기화합니다.
    setRoute(null);
    setDestinationId('');
  }, [currentLoc, selectedFloor]);


  if (!currentFloorData) {
    return (
      <div className="p-4 text-center text-red-400 bg-slate-800 rounded-lg shadow-md">
        선택된 층의 지도 정보를 찾을 수 없습니다. (층: {selectedFloor || '알 수 없음'})
      </div>
    );
  }

  const { places, svgWidth, svgHeight, viewBox } = currentFloorData;
  const highlightedPlace = getPlaceById(currentLoc);

  // 경로 찾기 핸들러
  const handleFindRoute = () => {
    if (!startPointId || !destinationId) {
      alert('출발지와 목적지를 모두 선택해주세요.');
      return;
    }
    if (startPointId === destinationId) {
        alert('출발지와 목적지가 같습니다.');
        return;
    }

    const startPlace = getPlaceById(startPointId);
    const destPlace = getPlaceById(destinationId);

    if (startPlace && destPlace) {
      // 간단한 직선 경로를 생성합니다 (A* 등 복잡한 알고리즘으로 확장 가능).
      setRoute({
        points: `${startPlace.cx},${startPlace.cy} ${destPlace.cx},${destPlace.cy}`,
        start: { cx: startPlace.cx, cy: startPlace.cy },
        end: { cx: destPlace.cx, cy: destPlace.cy }
      });
    }
  };

  // 경로 초기화 핸들러
  const handleResetRoute = () => {
    setRoute(null);
    setDestinationId('');
    // QR로 스캔한 현재 위치는 출발지로 유지합니다.
    setStartPointId(currentLoc || '');
  };

  const markerStyle = {
    fill: "#fde047", // yellow-300
    stroke: "#1e293b", // slate-800
    strokeWidth: 2.5,
    filter: "drop-shadow(0px 3px 4px rgba(0,0,0,0.6))",
    transition: "all 0.3s ease",
  };

  const getMarker = (place) => {
    if (place) {
      return <circle cx={place.cx} cy={place.cy} r="12" style={markerStyle} />;
    }
    return null;
  };

  const routeLineStyle = {
      stroke: '#22d3ee', // cyan-400
      strokeWidth: 4,
      strokeDasharray: "10 5",
      fill: 'none',
       animation: 'dash 1s linear infinite'
  };

  const routeEndpointStyle = {
      stroke: '#f87171', // red-400
      strokeWidth: 3,
  }

  return (
    <div className="w-full max-w-2xl p-2 sm:p-4 bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl">
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-sky-300">
        {currentFloorData.name}
      </h3>

      {/* --- 경로 탐색 UI 추가 --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 px-2">
        <div>
          <label htmlFor="start-point" className="block text-sm font-medium text-slate-300 mb-1">출발지</label>
          <select
            id="start-point"
            value={startPointId}
            onChange={(e) => setStartPointId(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="" disabled>출발지 선택</option>
            {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-300 mb-1">목적지</label>
          <select
            id="destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="" disabled>목적지 선택</option>
            {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-center gap-4 mb-6">
        <button onClick={handleFindRoute} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-150">
          경로 찾기
        </button>
        <button onClick={handleResetRoute} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-150">
          초기화
        </button>
      </div>
      {/* --- 경로 탐색 UI 끝 --- */}

      <svg
        width="100%"
        height="auto"
        viewBox={viewBox || `0 0 ${svgWidth || 500} ${svgHeight || 250}`}
        className="border-2 border-slate-600 rounded-lg shadow-lg mx-auto bg-slate-700/50"
        aria-labelledby="mapTitle"
        role="img"
      >
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: -20;
              }
            }
          `}
        </style>
        <title id="mapTitle">{currentFloorData.name} 실내 지도</title>
        {places.map((place) => (
          <g key={place.id} role="listitem" aria-label={place.name}>
            {place.shape === 'rect' && (
              <rect
                x={place.details.x}
                y={place.details.y}
                width={place.details.width}
                height={place.details.height}
                fill={place.details.fill || '#d1d5db'}
                stroke={place.details.stroke || '#6b7280'}
                strokeWidth={place.details.strokeWidth || 1}
                rx="5"
              />
            )}
            <text
              x={place.textX}
              y={place.textY}
              fontSize="20"
              fontWeight="medium"
              fill={place.textFill || '#1f2937'}
              className="pointer-events-none select-none"
              textAnchor="middle"
            >
              {place.name}
            </text>
          </g>
        ))}

        {/* 경로 그리기 */}
        {route && (
            <g>
                <polyline points={route.points} style={routeLineStyle} />
                <circle cx={route.start.cx} cy={route.start.cy} r="8" fill="#38bdf8" style={routeEndpointStyle} />
                <circle cx={route.end.cx} cy={route.end.cy} r="8" fill="#f87171" style={routeEndpointStyle}/>
            </g>
        )}

        {/* 현재 위치 마커 (경로 탐색 중이 아닐 때만 표시) */}
        {highlightedPlace && !route && getMarker(highlightedPlace)}

      </svg>
       <div className="mt-6 text-center">
        <a
          href="/"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-lg text-base shadow-md hover:shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75"
        >
          다른 층 보기 / 메인으로
        </a>
      </div>
    </div>
  );
};

export default IndoorMap;
