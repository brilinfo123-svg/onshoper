// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { serialize } from "cookie";

// export default NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         contact: { label: "Contact", type: "text" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.contact) return null;

//         // ✅ Yaha DB lookup add kar sakta hai user verify karne ke liye
//         return { id: credentials.contact, contact: credentials.contact };
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.JWT_SECRET,
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.user = user;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user = token.user;
//       return session;
//     },
//   },
//   events: {
//     async signIn({ user }) {
//       // ⚠️ Events me response mutate nahi hota.
//       // Yaha sirf logging ya side-effects kar sakte ho.
//       console.log("User signed in:", user.contact);
//     },
//     async signOut({ token }) {
//       console.log("User signed out:", token?.user?.contact);
//     },
//   },
// });


















import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default NextAuth({
providers:[
CredentialsProvider({
name:"Credentials",

credentials:{
contact:{
label:"Contact",
type:"text"
}
},

async authorize(credentials){

if(!credentials?.contact){
return null;
}

await dbConnect();

const user=await User.findOne({
contact:credentials.contact
});


if(!user){
return null;
}


return {
id:user._id.toString(),
contact:user.contact,
name:user.name,
photo:user.photo
};

}

})
],


session:{
strategy:"jwt"
},


secret:process.env.JWT_SECRET,


callbacks:{


async jwt({token,user}){

if(user){

token.id=user.id;
token.contact=user.contact;
token.name=user.name;
token.photo=user.photo;

}

return token;

},



async session({session,token}){


session.user={
id:token.id,
contact:token.contact,
name:token.name,
photo:token.photo
};


return session;

}


}

});