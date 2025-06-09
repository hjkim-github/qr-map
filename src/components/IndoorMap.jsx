import React from 'react';

// SVG 캔버스 크기
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;

function IndoorMap({ nodes, path, currentLocation, destination }) {
  
  const renderPath = () => {
    if (!path || path.length < 2) {
      return null;
    }
    // SVG polyline을 위한 포인트 문자열 생성
    const points = path.map(node => `${node.x},${node.y}`).join(' ');
    return <polyline points={points} fill="none" stroke="#3498db" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />;
  };

  const renderNodes = () => {
    return nodes.map(node => {
        let color = '#95a5a6'; // 일반 노드 기본 색상
        let radius = 8;       // 일반 노드 기본 크기

        if (currentLocation && node.node_id === currentLocation.node_id) {
            color = '#2ecc71'; // 현재 위치(녹색)
            radius = 12;
        } else if (destination && node.node_id === destination.node_id) {
            color = '#e74c3c'; // 목적지(빨간색)
            radius = 12;
        }

        return (
            <g key={node.node_id}>
                <circle cx={node.x} cy={node.y} r={radius} fill={color} />
                <text x={node.x + 15} y={node.y + 5} fontSize="12" fill="#34495e" fontWeight="bold">
                    {node.name}
                </text>
            </g>
        );
    });
  };

  return (
    <div className="map-container">
      <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ border: '1px solid #ccc', borderRadius: '8px' }}>
        {/* 경로를 먼저 렌더링하여 노드가 위에 오도록 함 */}
        {renderPath()}
        {/* 모든 노드를 렌더링 */}
        {renderNodes()}
      </svg>
    </div>
  );
}

export default IndoorMap;
