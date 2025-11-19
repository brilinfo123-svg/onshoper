// hash.js
import bcrypt from "bcrypt";

async function generateHash() {
  const password = ""; 
  const saltRounds = 12; // security level (10–12 recommended)

  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Generated Hash:", hash);
}

generateHash();
