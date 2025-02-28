import React from "react";
import PropTypes from "prop-types";
import { useSpring, animated } from "@react-spring/web";
import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/avatars-avataaars-sprites";

const Dashboard = ({ totalSales = 0, topPerformer = null, todaysSales = 0, theme }) => {
  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  const cardStyle = {
    backgroundColor: theme === "light" ? "#FFFFFF" : "#0A0A0A",
    color: theme === "light" ? "#000000" : "#FFFFFF",
  };

  // Generate the SVG string for the avatar
  const avatarSvg = topPerformer
    ? createAvatar(style, {
        seed: topPerformer.name,
        // Customize the avatar style
        radius: 50, // Rounder avatar
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9"], // Random background color
        scale: 100, // Larger size
      })
    : null;

  return (
    <animated.div style={fadeIn} className="grid grid-cols-1 md:grid-cols-3 w-full gap-8">
      {/* Today's Sales */}
      <div style={cardStyle} className="p-8 rounded-lg hover:shadow-lg font-bold">
        <h2 className="text-2xl mb-2">Today's Sales</h2>
        <p className="text-4xl">${todaysSales.toFixed(2)}</p>
      </div>

      {/* Total Sales */}
      <div style={cardStyle} className="p-8 rounded-lg hover:shadow-lg font-bold">
        <h2 className="text-2xl mb-2">Total Sales</h2>
        <p className="text-4xl">${totalSales.toFixed(2)}</p>
      </div>

      {/* Top Performer */}
      <div style={cardStyle} className="p-8 rounded-lg hover:shadow-lg font-bold flex items-center">
        <div className="mr-4">
          <h2 className="text-2xl mb-2">Top Performer</h2>
          {topPerformer ? (
            <>
              <p className="text-lg">
                <strong>Name:</strong> {topPerformer.name}
              </p>
              <p className="text-lg">
                <strong>Sales:</strong> ${topPerformer.totalSales.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-lg">No top performer found</p>
          )}
        </div>

        {/* Cartoon Avatar */}
        {topPerformer && (
          <div
            className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow"
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
          />
        )}
      </div>
    </animated.div>
  );
};

Dashboard.propTypes = {
  totalSales: PropTypes.number,
  topPerformer: PropTypes.object,
  todaysSales: PropTypes.number,
  theme: PropTypes.string.isRequired,
};

export default Dashboard;