// typescript
import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

const dbPath = path.resolve( process.cwd(), "gameState.db");

export async function verMemoria(resourceId: string) {
  const db: Database<sqlite3.Database, sqlite3.Statement> = await open({
    filename: dbPath,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });

  try {
    const row = await db.get("SELECT * FROM main.mastra_threads WHERE resourceId = ? LIMIT 1", resourceId);
    if (!row) {
      console.log(`No se encontró ningún registro para resourceId=${resourceId}`);
      return;
    }

    // console.log("Registro completo:", row);

    const possibleFields = ["metadata", "meta", "data", "workingMemory"];
    let metadata: any = null;

    for (const f of possibleFields) {
      if (row[f] !== undefined && row[f] !== null) {
        metadata = row[f];
        // console.log(`Campo encontrado: ${f}`);
        break;
      }
    }

    if (metadata === null) {
      console.log("No se encontró un campo conocido; mostrando fila completa.");
      return;
    }

    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        // mantener string si no es JSON
      }
    }

    if (typeof metadata === "object" && metadata !== null) {
      const wmKey = Object.keys(metadata).find(k => /working.*memory|memory|working/i.test(k));
      if (wmKey) {
        console.log(`WorkingMemory (${wmKey}):\n`, metadata[wmKey]);
      } else {
        console.log("Metadata (object):\n", metadata);
      }
    } else {
      console.log("Metadata (raw):\n", metadata);
    }
  } finally {
    await db.close();
  }
}

const resourceId = process.argv[2] || "1234";
verMemoria(resourceId).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});