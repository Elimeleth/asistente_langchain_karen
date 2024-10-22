import { tool } from "@langchain/core/tools";
// import { Calculator } from "@langchain/community/"
import { z } from "zod";

/**
 * Note that the descriptions here are crucial, as they will be passed along
 * to the model along with the class name.
 */
const calculatorSchema = z.object({
  operation: z
    .enum(["suma", "resta", "multiplicacion", "divicion"])
    .describe("el tipo de operacion a ejecutar."),
  number1: z.number().describe("el primer numero operando."),
  number2: z.number().describe("el segundo numero operando."),
});

export const calculatorTool = tool(
  async ({ operation, number1, number2 }) => {
    // Functions must return strings
    if (operation === "suma") {
      return `${number1 + number2}`;
    } else if (operation === "resta") {
      return `${number1 - number2}`;
    } else if (operation === "multiplicacion") {
      return `${number1 * number2}`;
    } else if (operation === "divicion") {
      return `${number1 / number2}`;
    } else {
      throw new Error("Invalid operation.");
    }
  },
  {
    name: "calculator",
    description: "Genera operaciones matematicas usando lenguaje natural",
    schema: calculatorSchema,
  }
);