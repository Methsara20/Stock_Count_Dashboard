import React from 'react';

const DepartmentTable = ({ departments }) => {
  if (!departments || departments.length === 0) {
    return <p>No department data available</p>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Department Summary</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Department</th>
                <th className="text-end">Available</th>
                <th className="text-end">Counted</th>
                <th className="text-end">Variance</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department || 'N/A'}</td>
                  <td className="text-end">{dept.available?.toLocaleString() || 0}</td>
                  <td className="text-end">{dept.counted?.toLocaleString() || 0}</td>
                  <td className={`text-end ${dept.variance_qty < 0 ? 'text-danger' : 'text-success'}`}>
                    {dept.variance_qty?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTable;