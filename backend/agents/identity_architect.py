from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate

agent = get_agent(temperature=0.5)

async def generate_resume_logic(username: str, skills_context: str, projects_context: str):
    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the Identity Architect Agent. You synthesize technical data into high-impact professional narratives.
    
    USER DATA:
    - Name: {username}
    - Verified Skills: {skills}
    - Analyzed Projects: {projects}
    
    TASK: Write a powerful 3-sentence professional summary. 
    Tone: Humanized, elite, and visionary. Avoid generic buzzwords.
    
    OUTPUT: Return ONLY the summary text.
    """)
    
    chain = prompt | agent
    response = await chain.ainvoke({
        "username": username,
        "skills": skills_context,
        "projects": projects_context
    })
    
    return response.content.strip()
