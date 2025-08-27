import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const USERNAME = "USERNAME"; // ganti
const REPO = "REPO";         // ganti
const BRANCH = "main";       // branch repo
const FILE_PATH = "numbers.json"; 
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// API URL GitHub
const API_URL = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`;

// ambil nombor
app.get("/numbers", async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const file = await response.json();
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const numbers = JSON.parse(content);
    res.json(numbers);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// tambah nombor
app.post("/add-number", async (req, res) => {
  const { number } = req.body;
  try {
    // ambil file lama
    const response = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const file = await response.json();
    const sha = file.sha;
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    let numbers = JSON.parse(content);

    // tambah nombor
    if (!numbers.includes(number)) numbers.push(number);

    // push balik ke GitHub
    await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add number ${number}`,
        content: Buffer.from(JSON.stringify(numbers, null, 2)).toString("base64"),
        sha,
        branch: BRANCH
      })
    });

    res.json({ message: `Nombor ${number} berjaya ditambah` });
  } catch (err) {
    console.error(err);
    res.json({ message: "Gagal tambah nombor" });
  }
});

// delete nombor
app.post("/delete-number", async (req, res) => {
  const { number } = req.body;
  try {
    // ambil file lama
    const response = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const file = await response.json();
    const sha = file.sha;
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    let numbers = JSON.parse(content);

    // delete nombor
    numbers = numbers.filter(n => n !== number);

    // push balik ke GitHub
    await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Delete number ${number}`,
        content: Buffer.from(JSON.stringify(numbers, null, 2)).toString("base64"),
        sha,
        branch: BRANCH
      })
    });

    res.json({ message: `Nombor ${number} berjaya dipadam` });
  } catch (err) {
    console.error(err);
    res.json({ message: "Gagal delete nombor" });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
