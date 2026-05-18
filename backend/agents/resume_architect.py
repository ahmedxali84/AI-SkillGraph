from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

agent = get_agent(temperature=0.4)

async def generate_resume_logic(user_data: dict, sections: list):
    logger.info(f"Initiating Resume Synthesis for: {user_data.get('fullName')}")
    logger.info(f"Sections requested: {sections}")
    
    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the SkillGraph Resume Architect. Your goal is to create a "9.5/10" score professional resume.
    
    INSTRUCTIONS:
    1. PROFESSIONAL POLISH: Rewrite the user's raw input into high-impact, executive-level technical narratives.
    2. KEYWORDS: Optimize for ATS (Applicant Tracking Systems) using relevant tech industry keywords.
    3. SECTIONS: Only include the following sections requested by the user: {requested_sections}
    4. FORMAT: Return the content structured for a premium resume layout.
    
    USER DATA: {data}
    
    OUTPUT FORMAT (JSON ONLY):
    {{
        "fullName": "...",
        "contact": {{ "email": "...", "phone": "...", "location": "...", "linkedin": "..." }},
        "summary": "...",
        "experience": [
            {{ "company": "...", "role": "...", "period": "...", "bulletPoints": ["...", "..."] }}
        ],
        "projects": [
            {{ "name": "...", "description": "...", "techStack": "...", "impact": "..." }}
        ],
        "skills": {{ "technical": ["...", "..."], "soft": ["...", "..."] }},
        "education": [
            {{ "institution": "...", "degree": "...", "year": "..." }}
        ],
        "atsScore": 9.5
    }}
    """)
    
    try:
        chain = prompt | agent
        response = await chain.ainvoke({
            "requested_sections": ", ".join(sections),
            "data": json.dumps(user_data)
        })

        content = response.content
        logger.info("Agent Response received. Parsing...")
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        parsed_data = json.loads(content)
        logger.info("Resume Synthesis Successful.")
        return parsed_data
    except Exception as e:
        logger.error(f"Resume Synthesis Error: {str(e)}")
        return {{ "error": str(e) }}
