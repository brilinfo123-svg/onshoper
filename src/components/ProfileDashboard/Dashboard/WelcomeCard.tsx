import React from "react";
import Image from "next/image";
import { FiCamera, FiCopy, FiCalendar } from "react-icons/fi";
import styles from "@/styles/profile/cards.module.scss";

const WelcomeCard = ({ onEditProfile, user, loading }) => {
  const isLoading = loading || !user;

  console.log("user", user)

  return (
    <div className={styles.welcomeCard}>
      
      {/* Left: Avatar */}
      <div className={styles.left}>
        <div className={styles.avatarWrapper}>
          
          {isLoading ? (
            <div className={styles.avatarSkeleton}></div>
          ) : (
            <Image
              src={user?.photo || "/images/profile.png"}
              alt="Profile"
              width={120}
              height={120}
              className={styles.avatar}
            />
          )}

          <button className={styles.cameraBtn}>
            <FiCamera />
          </button>
        </div>
      </div>

      {/* Middle */}
      <div className={styles.center}>
        
        {isLoading ? (
          <div className={styles.titleSkeleton}></div>
        ) : (
          <h2 className={styles.title}>
            Welcome {user?.name || "User"}! 👋
          </h2>
        )}

        {isLoading ? (
          <div className={styles.subtitleSkeleton}></div>
        ) : (
          <p className={styles.subtitle}>
            Manage your ads, rentals, and account activity
          </p>
        )}

        <div className={styles.infoRow}>
          {isLoading ? (
            <>
              <div className={styles.infoSkeleton}></div>
              <div className={styles.infoSkeleton}></div>
            </>
          ) : (
            <>
              <span className={styles.infoItem}>
                <FiCalendar /> Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>

              <span className={styles.infoItem}>
                <FiCopy /> Shop ID: {user?._id || "N/A"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {isLoading ? (
          <div className={styles.editSkeleton}></div>
        ) : (
          <button className={styles.editBtn} onClick={onEditProfile}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;
