import "dotenv/config"
import { Workflow, GlobalRouter, Database } from "@elimeleth/vaincentflow"
import { MetaProvider } from "@builderbot/provider-meta"

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { instructions } from "./prompt";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { calculatorTool } from "./tool";

const template = ChatPromptTemplate.fromMessages([
    ["system", instructions],
    ["human", "{input}"]
])

const model = new ChatGroq({
    model: "llama-3.1-70b-versatile",
    temperature: .1
  });

const chain = model.bindTools([calculatorTool])

const flow = new Workflow("any")
    .addAction(async (ctx, { send }) => {
        console.time("groq")
        const respuesta = await chain.invoke(ctx.body as string) as any
        console.log({ respuesta })
        console.timeEnd("groq")

        return await send(respuesta.content)
    })

export const database = new Database({
    type: "postgres",
    initialDatabase: "postgres",
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as any),
    password: process.env.DATABASE_PWD,
    username: process.env.DATABASE_USER
})

let provider = new MetaProvider({
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: "v20.0"
})


new GlobalRouter({
    provider,
    database
})
    .addFlows([flow])
    .listen().then(console.log)