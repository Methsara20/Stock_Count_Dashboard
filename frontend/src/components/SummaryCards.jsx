import React from 'react';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card text-white bg-primary">
          <div className="card-body">
            <h6 className="card-title">Total System Stock</h6>
            <h3 className="mb-0">{summary.totalSystemStock?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card text-white bg-success">
          <div className="card-body">
            <h6 className="card-title">Total Scanned Qty</h6>
            <h3 className="mb-0">{summary.totalScannedQty?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card text-white bg-warning">
          <div className="card-body">
            <h6 className="card-title">Difference</h6>
            <h3 className="mb-0">{summary.difference?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card text-white bg-info">
          <div className="card-body">
            <h6 className="card-title">Coverage %</h6>
            <h3 className="mb-0">{summary.coveragePercent || 0}%</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;