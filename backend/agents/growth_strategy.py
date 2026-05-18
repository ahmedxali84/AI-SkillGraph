from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate
import json

agent = get_agent(temperature=0.7)

async def generate_tasks_logic(skills_profiles: str):
    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the Growth Strategy Agent. You design daily missions to push technical boundaries.
    
    USER PROFILE: {profiles}
    
    TASK: Generate 3 unique, actionable daily missions. Each mission should target a specific skill from the profile.
    Make the missions sound human, engaging, and purposeful.
    
    OUTPUT SPECIFICATION (JSON LIST OF OBJECTS):
    [
        {{
            "id": "unique_string",
            "title": "Engaging mission title",
            "description": "Clear, human-centric 1-sentence instruction",
            "skill": "Target Skill Name",
            "xp": integer (50-100)
        }}
    ]
    """)
    
    chain = prompt | agent
    response = await chain.ainvoke({"profiles": skills_profiles})
    
    try:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except:
        return [
            {"id": "t1", "title": "Architectural Refinement", "description": "Identify and optimize a critical path in your current architecture.", "skill": "Architecture", "xp": 80},
            {"id": "t2", "title": "Strategic Resilience", "description": "Implement robust error handling for mission-critical modules.", "skill": "Reliability", "xp": 90}
        ]
