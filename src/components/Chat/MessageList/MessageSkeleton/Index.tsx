import styles from "./index.module.scss";

const items=[
{side:"left",size:"sm"},
{side:"right",size:"lg"},
{side:"left",size:"md"},
{side:"right",size:"sm"},
{side:"left",size:"lg"},
{side:"right",size:"md"},
{side:"left",size:"sm"},
{side:"right",size:"lg"},
];

export default function MessageSkeleton(){

return(

<>

{items.map((item,index)=>(

<div
key={index}
className={`${styles.row} ${styles[item.side]}`}
>

<div
className={`${styles.bubble} ${styles[item.size]}`}
>

<div className={styles.line}></div>

<div className={styles.time}></div>

</div>

</div>

))}

</>

);

}