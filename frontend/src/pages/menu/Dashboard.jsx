import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import TimeAgo from "../../components/TimeAgo";

import Layout from "../../components/Layout";

const Dashboard = () => {
  const mainPanel = React.useRef(null);

  function addWidget(
    title,
    icon,
    value,
    percentage,
    timestamp,
    color = undefined
  ) {
    const date = new Date();
    date.setHours(date.getHours() + 30);
    return (
      <div>
        {
          <span
            className="material-icons-sharp"
            style={{
              background: color,
            }}
          >
            {icon}
          </span>
        }
        <div className="middle">
          <div className="left">
            <h3>{title}</h3>
            <h1>{value}</h1>
          </div>
          <div className="progress">
            <CircularProgressbar value={percentage} text={`${percentage}%`} />
          </div>
        </div>
        <small className="text-muted">
          <TimeAgo timestamp={timestamp} />
        </small>
      </div>
    );
  }

  return (
    <Layout>
      <h1>Dashboard</h1>
      <div className="date">
        <input type="date" />
      </div>

      <div className="insights">
        {addWidget(
          "Total Sales",
          "analytics",
          "Rp.10.360.100",
          81,
          1682232248000
        )}
        {addWidget(
          "Total Expenses",
          "bar_chart",
          "Rp.3.579.410",
          53,
          1682379848000,
          "var(--color-danger)"
        )}
        {addWidget(
          "Total Income",
          "stacked_line_chart",
          "Rp.5.123.470",
          12,
          1684626248000,
          "var(--color-success)"
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
