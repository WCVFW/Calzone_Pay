import React from "react";
import { Link, useLocation } from "react-router-dom";

const serviceItems = [
  { name: "Mobile", icon: "phone.svg", link: "/recharge" },
  { name: "Card", icon: "card.svg", link: "/card" },
  { name: "Broadband", icon: "broadband.svg", link: "/broadband" },
  { name: "Landline", icon: "landphone.svg", link: "/landline" },
  { name: "Cable TV", icon: "tv.svg", link: "/cabletv" },
  { name: "Electricity", icon: "eletricity.svg", link: "/electricity" },
  { name: "Gas", icon: "gas.svg", link: "/gas" },
  { name: "Water", icon: "water.svg", link: "/water" },
];

const ServiceTabs: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fasilities__wrapper pb-2">
      <div className="fasilities__inner d-flex flex-wrap justify-content-center gap-1 px-1">
        {serviceItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className={`fasilities__item d-flex align-items-center justify-content-center px-1 py-1 border rounded text-nowrap ${
              location.pathname === item.link ? "active" : ""
            }`}
            style={{
              textDecoration: "none",
              color: "inherit",
              minWidth: "fit-content",
              fontSize: "10px",
              flex: "1 1 auto",
              maxWidth: "120px",
            }}
          >
            <span className="icon me-1" style={{ minWidth: "12px" }}>
              <img
                src={`/assets/img/svg/${item.icon}`}
                alt={item.name}
                width="12"
                height="12"
              />
            </span>
            <span className="fz-9 fw-500" style={{ fontSize: "10px" }}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;