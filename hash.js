const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "admin76528";

  const hash = await bcrypt.hash(password, 12);

  console.log("Generated Hash:", hash);

  const verified = await bcrypt.compare(password, hash);

  console.log("Verified:", verified);
}

generateHash();