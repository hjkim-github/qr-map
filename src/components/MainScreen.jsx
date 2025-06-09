import React from 'react';

function MainScreen({ nodes, onDestinationSelect, currentLocation, destination }) {

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      onDestinationSelect(selectedId);
    }
  };

  return (
    <div className="main-screen">
      <h1>QR코드 실내 내비게이션</h1>
      <div className="navigation-controls">
        <div className="location-info">
            <strong>현재 위치:</strong> {currentLocation ? currentLocation.name : '미설정'}
        </div>
        
        <div className="destination-selector">
          <label htmlFor="destination-select">목적지를 선택하세요: </label>
          <select 
            id="destination-select" 
            onChange={handleSelect}
            value={destination ? destination.node_id : ""}
          >
            <option value="">목적지 선택...</option>
            {nodes
              .filter(node => node.node_id !== currentLocation?.node_id)
              .map(node => (
              <option key={node.node_id} value={node.node_id}>
                {node.name} (층: {node.floor})
              </option>
            ))}
          </select>
        </div>
        
        <div className="location-info">
            <strong>목적지:</strong> {destination ? destination.name : '미설정'}
        </div>
      </div>
    </div>
  );
}

export default MainScreen;
