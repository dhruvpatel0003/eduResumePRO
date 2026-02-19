import React from 'react';

const TabOverview = ({ tabs, selections, onToggle, onSelectTab }) => {
  return (
    <div className="tab-overview-list">
      {tabs.map(tab => {
        const isSelected = selections.includes(tab);
        return (
          <div
            key={tab}
            className={`tab-overview-item ${isSelected ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(tab)}
            />
            <span
              className="tab-pill"
              onClick={() => onSelectTab(tab)}
            >
              {tab}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TabOverview;
