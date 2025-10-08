import React, { useState } from "react";
import styles from "./Index.module.scss";
import Loader from "../loader/Index";

interface Service {
  _id: string;
  name: string;
  price: string | number;
  discount: string | number;
}

interface ServiceListProps {
  services: Service[];
  onUpdateServices: (updatedServices: Service[]) => void;
}

const ServicesList: React.FC<ServiceListProps> = ({ services, onUpdateServices }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedService, setEditedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // Add state for delete loading

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditedService({ ...services[index] });
  };

  const handleSaveClick = async () => {
    if (editedService) {
      setIsLoading(true);
      const response = await fetch("/api/update-service", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: editedService._id,
          updatedService: editedService,
        }),
      });

      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        const updatedServices = [...services];
        updatedServices[editingIndex!] = editedService;
        onUpdateServices(updatedServices);
        setEditingIndex(null);
        setEditedService(null);
        alert("Service updated successfully!");
      } else {
        alert(data.message || "Failed to update the service.");
      }
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (editedService) {
      setEditedService({
        ...editedService,
        [field]: value,
      });
    }
  };

  const handleDeleteClick = async (serviceId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this service?");
    if (confirmed) {
      setIsDeleting(true); // Start loading state for deletion

      const response = await fetch("/api/remove-service", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId }),
      });

      const data = await response.json();
      setIsDeleting(false); // End loading state after deletion

      if (response.ok) {
        const updatedServices = services.filter((service) => service._id !== serviceId);
        onUpdateServices(updatedServices);
        alert("Service deleted successfully!");
      } else {
        alert(data.message || "Failed to delete the service.");
      }
    }
  };

  return (
    <div className={styles.tabelWrapper}>
      {isLoading && <Loader message=" Updating service, please wait..." />}
      {isDeleting && <Loader message=" Deleting service, please wait..." />} {/* Loader for delete */}
      <div className={styles.container}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index}>
                  {editingIndex === index ? (
                    <>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          value={editedService?.name || ""}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedService?.price || ""}
                          onChange={(e) => handleFieldChange("price", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedService?.discount || ""}
                          onChange={(e) => handleFieldChange("discount", e.target.value)}
                        />
                      </td>
                      <td>
                        <button className={styles.saveButton} onClick={handleSaveClick}>
                          Save
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{index + 1}</td>
                      <td>{service.name}</td>
                      <td className={styles.servicePrice}>
                        <span className="icon-rupee"></span>
                        {service.price}
                      </td>
                      <td className={styles.discount}>{service.discount}%</td>
                      <td>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditClick(index)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleDeleteClick(service._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicesList;
