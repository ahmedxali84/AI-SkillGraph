from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate

agent = get_agent(temperature=0.4)

async def generate_project_description_logic(name: str, context: str = ""):
    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the Context Architect. Your job is to describe a technical project based on its name and available context.
    
    PROJECT NAME: {name}
    AVAILABLE CONTEXT: {context}
    
    TASK: Write a 2-sentence highly professional and human-centric description of this project. 
    Focus on the "why" and the technical value proposition. 
    Do not use generic filler words.
    
    OUTPUT: Return ONLY the description.
    """)
    
    chain = prompt | agent
    response = await chain.ainvoke({
        "name": name,
        "context": context
    })
    
    return response.content.strip()
