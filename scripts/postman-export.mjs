import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const sourcePath = path.join(
  rootDir,
  "postman",
  "Attendance-School-API.postman_collection.json"
);
const outputDir = path.join(rootDir, "postman", "dist");
const outputPath = path.join(outputDir, "Attendance-School-API.postman_collection.json");

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(sourcePath, outputPath);

console.log(`Postman collection exported to ${outputPath}`);
