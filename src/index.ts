import "dotenv/config"
import { Workflow, GlobalRouter } from "@elimeleth/vaincentflow"
import { MetaProvider } from "@builderbot/provider-meta"

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { instructions } from "./prompt";
import { tools } from "./tool";

import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";

const prompt = ChatPromptTemplate.fromMessages([
    ["system", instructions],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
])

const llm = new ChatGroq({
    model: "llama-3.1-70b-versatile",
    temperature: .1
});

const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
});

const agentExecutor = new AgentExecutor({
    agent,
    tools,
});


// const chain = template.pipe(model.bindTools(tools))

const flow = new Workflow("any")
    .addAction(async (ctx, { send }) => {

        console.time("groq")
        const { output } = await agentExecutor.invoke({ input: ctx.body });
        console.timeEnd("groq")

        return await send(output)
    })


let provider = new MetaProvider({
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: "v20.0"
})


new GlobalRouter({
    provider
})
    .addFlows([flow])
    .listen().then(console.log)