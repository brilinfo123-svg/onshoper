import styles from "./index.module.scss";

export default function ChatSidebarSkeleton(){
return(
<>

{Array.from({length:10}).map((_,index)=>(

<div key={index} className={styles.item}>
    <div className={styles.avatar}></div>
    <div className={styles.content}>
    <div className={styles.top}>
        <div className={styles.name}></div>
        <div className={styles.time}></div>
    </div>
        <div className={styles.bottom}>
            <div className={styles.message}></div>
            <div className={styles.badge}></div>
        </div>
    </div>
</div>

))}

</>

);

}