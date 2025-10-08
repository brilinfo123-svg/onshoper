import { useState } from "react";
import styles from "./Index.module.scss";

const EditableTable = () => {
  // Initial services data
  const [services, setServices] = useState([
    { id: 1, name: "Women's Haircut", price: 25, discount: "5%" },
    { id: 2, name: "Men's Haircut", price: 225, discount: "20%" },
    { id: 3, name: "Child's Haircut", price: 325, discount: "15%" },
    { id: 4, name: "Hair Color", price: 25, discount: "5%" },
    { id: 5, name: "Highlights/Lowlights", price: 725, discount: "0%" },
    { id: 6, name: "Balayage/Ombre", price: 125, discount: "0%" },
    { id: 7, name: "Hair Extensions", price: 325, discount: "25%" },
    { id: 8, name: "Manicure", price: 325, discount: "10%" },
    { id: 9, name: "Pedicure", price: 725, discount: "0%" },
    { id: 10, name: "Nail Art", price: 225, discount: "5%" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (
    id: number,
    field: "name" | "price" | "discount",
    value: string | number
  ) => {
    const updatedServices = services.map((service) =>
      service.id === id ? { ...service, [field]: value } : service
    );
    setServices(updatedServices);
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate an API call or processing
    setTimeout(() => {
      console.log("Updated Services Data:", services);
      alert("Profile updated successfully!");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className={styles.editableTableContainer}>
      <table className={styles.editableTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Service</th>
            <th>Price</th>
            <th>Discount</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={service.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) =>
                    handleInputChange(service.id, "name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) =>
                    handleInputChange(service.id, "price", Number(e.target.value))
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={service.discount}
                  onChange={(e) =>
                    handleInputChange(service.id, "discount", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.updatePackage}>
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Update Now"}
      </button>
      </div>
    </div>
  );
};

export default EditableTable;