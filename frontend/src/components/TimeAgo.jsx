import React from "react";
import TimeAgo from "javascript-time-ago";
import ReactTimeAgo from "react-time-ago";
import id from "javascript-time-ago/locale/id.json";
TimeAgo.addDefaultLocale(id);

const TimeAgoEx = ({ timestamp }) => {
  return <ReactTimeAgo date={new Date(timestamp)} locale="id-ID" />;
};

export default TimeAgoEx;
