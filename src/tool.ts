import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { appendRow, getSpreadsheetData } from "./sheet";

export const get_data = tool(
  async () => {
    const data = await getSpreadsheetData()
    console.log({ data })

    return JSON.stringify(data)
  },
  {
    name: "get_data",
    description: "Obtiene los nombres y emails de los usuarios"
  }
);

export const add_data = tool(
  async ({ nombre, email }) => {
    console.log({ nombre, email })
    await appendRow({ nombre, email })
    return "Datos actualizados"
  },
  {
    name: "add_data",
    description: "Agrega el nombre y el email del usuario",
    schema: z.object({
      nombre: z
        .string()
        .describe("el nombre del usuario."),
      email: z.string().describe("el email del usuario."),
    })
  }
);

export const tools = [get_data, add_data]