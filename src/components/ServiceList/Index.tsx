import React from "react";
import styles from "./Index.module.scss";

// const services = [
//   { name: "Women's Haircut", price: "25", discount: "5" },
//   { name: "Men's Haircut", price: "225", discount: "20" },
//   { name: "Child's Haircut", price: "325", discount: "15" },
//   { name: "Hair Color", price: "25", discount: "5" },
//   { name: "Highlights/Lowlights", price: "725", discount: "0" },
//   { name: "Balayage/Ombre", price: "125", discount: "0" },
//   { name: "Hair Extensions", price: "325", discount: "25" },
//   { name: "Manicure", price: "325", discount: "10" },
//   { name: "Pedicure", price: "725", discount: "0" },
//   { name: "Nail Art", price: "225", discount: "5" },
//   { name: "Acrylic Full Set", price: "205", discount: "0" },
//   { name: "Scalp Massage", price: "125", discount: "10" },
//   { name: "Haircut & Manicure Combo", price: "2995", discount: "100" },
// ];

interface Props {
  length: any;
  services?: any; // Determines if the badge is shown
}

const ServiceList: React.FC<Props> = ({ services = [] }) => {
  // Use services directly (if provided) instead of data.length
  const totalServices = services; // This is the actual list of services

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{totalServices.length}</th> {/* Display the number of services */}
              <th>Service</th>
              <th>Price</th>
              <th>Discount</th> {/* New Discount column */}
            </tr>
          </thead>
          <tbody>
            {totalServices.map((service, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{service.name}</td>
                <td className={styles.servicePrice}>
                  <span className="icon-rupee"></span> {service.price}
                </td>
                <td className={styles.discount}>{service.discount}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceList;
