from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate

agent = get_agent(temperature=0.3)

async def dashboard_overview_logic(username: str, score: int, skills_context: str):
    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the Strategic Overview Agent. You provide a concise "Intelligence Briefing" to the user.
    
    USER STATS:
    - Username: {username}
    - Score: {score} XP
    - Skills: {skills}
    
    TASK: Provide a 1-sentence punchy, humanized "Strategic Briefing" about their current standing. 
    Focus on inspiration and next steps for dominance.
    
    OUTPUT: Return ONLY the briefing text.
    """)
    
    chain = prompt | agent
    response = await chain.ainvoke({
        "username": username,
        "score": score,
        "skills": skills_context
    })
    
    return response.content.strip()
