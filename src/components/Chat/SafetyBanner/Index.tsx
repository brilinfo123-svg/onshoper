// components/Chat/SafetyBanner.jsx
"use client";

import styles from "./index.module.scss";

export default function SafetyBanner(){
return(
<div className={styles.banner}>
<p>⚠️ Don’t share OTPs or passwords. Pay only after verification.</p>
</div>
);
}