import os
import json
import httpx
import base64
import re
import time
from io import BytesIO
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pypdf import PdfReader

# Import logic from separate agent files
from agents.intelligence_architect import analyze_project_logic
from agents.growth_strategy import generate_tasks_logic
from agents.identity_architect import generate_resume_logic as generate_identity_logic
from agents.strategic_overview import dashboard_overview_logic
from agents.context_architect import generate_project_description_logic
from agents.venture_architect import analyze_venture_logic, evolve_venture_logic
from agents.resume_architect import generate_resume_logic as generate_full_resume_logic
from agents.genome_architect import analyze_genome_logic

load_dotenv()

app = FastAPI(title="SkillGraph AI Protocol Backend", version="1.0.0")

# --- CYBERSECURITY CONTROLS ---
# Simple in-memory rate limiting dictionary
ip_request_history = {}
RATE_LIMIT_SECONDS = 60
MAX_REQUESTS_PER_PERIOD = 15

async def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    if client_ip not in ip_request_history:
        ip_request_history[client_ip] = []
        
    # Clean up old timestamps
    ip_request_history[client_ip] = [t for t in ip_request_history[client_ip] if current_time - t < RATE_LIMIT_SECONDS]
    
    if len(ip_request_history[client_ip]) >= MAX_REQUESTS_PER_PERIOD:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. System secured against high-frequency operations."
        )
        
    ip_request_history[client_ip].append(current_time)

def sanitize_input_text(text: str) -> str:
    if not text:
        return ""
    # Secure against HTML/script tag injection
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    return text.strip()

# --- DEEP GITHUB CRAWLER AND ANALYZER ---
async def get_deep_github_content(repo_url: str) -> str:
    if not repo_url or "github.com" not in repo_url:
        return ""
    
    try:
        repo_path = repo_url.split("github.com/")[-1].strip("/")
        async with httpx.AsyncClient() as client:
            token = os.getenv("GITHUB_TOKEN")
            headers = {"Authorization": f"token {token}"} if token else {}
            
            # 1. Fetch main repo details to find default branch
            repo_api_url = f"https://api.github.com/repos/{repo_path}"
            repo_info = await client.get(repo_api_url, headers=headers)
            default_branch = "main"
            if repo_info.status_code == 200:
                default_branch = repo_info.json().get("default_branch", "main")
            
            # 2. Fetch README content
            readme_content = ""
            readme_resp = await client.get(f"https://api.github.com/repos/{repo_path}/readme", headers=headers)
            if readme_resp.status_code == 200:
                readme_content = base64.b64decode(readme_resp.json()["content"]).decode("utf-8")[:3000]
            
            # 3. Get directory tree structure
            tree_api_url = f"https://api.github.com/repos/{repo_path}/git/trees/{default_branch}?recursive=1"
            tree_resp = await client.get(tree_api_url, headers=headers)
            file_tree_list = []
            manifest_files = {}
            
            if tree_resp.status_code == 200:
                tree_data = tree_resp.json()
                for item in tree_data.get("tree", [])[:80]:  # Limit to top 80 file entries
                    path = item.get("path", "")
                    file_type = "File" if item.get("type") == "blob" else "Directory"
                    file_tree_list.append(f"- {path} ({file_type})")
                    
                    # Track manifest files
                    base_name = path.split("/")[-1]
                    if base_name in ["package.json", "requirements.txt", "Cargo.toml", "go.mod", "tsconfig.json"]:
                        manifest_files[path] = item.get("url")
            
            # 4. Fetch manifest file contents deeply
            manifests_content = []
            for path, file_url in list(manifest_files.items())[:3]:  # Limit to top 3 manifest files
                file_resp = await client.get(file_url, headers=headers)
                if file_resp.status_code == 200:
                    try:
                        content_b64 = file_resp.json().get("content", "")
                        content_decoded = base64.b64decode(content_b64).decode("utf-8")[:1200]
                        manifests_content.append(f"--- File Content: {path} ---\n{content_decoded}")
                    except Exception as e:
                        print(f"Failed decoding manifest {path}: {e}")
            
            # 5. Build structured payload for agent
            result_payload = []
            result_payload.append("=== REPOSITORY ARCHITECTURAL STRUCTURE ===")
            result_payload.append("\n".join(file_tree_list) if file_tree_list else "No tree structure could be parsed.")
            
            if manifests_content:
                result_payload.append("\n=== KEY TECHNICAL DEPENDENCY CONFIGURATIONS ===")
                result_payload.append("\n\n".join(manifests_content))
                
            if readme_content:
                result_payload.append("\n=== README DOCUMENTATION ===")
                result_payload.append(readme_content)
                
            return "\n".join(result_payload)[:8000]
    except Exception as e:
        print(f"Deep Github parser error: {e}")
        return f"Error while reading repository deeply: {e}"

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ResumeGenerationRequest(BaseModel):
    user_data: Dict[str, Any]
    sections: List[str]

class RepoAnalysisRequest(BaseModel):
    repo_url: Optional[str] = None
    project_description: Optional[str] = None
    source_type: str = "Manual"

class ContextRequest(BaseModel):
    name: str
    context: Optional[str] = ""

class Skill(BaseModel):
    name: str
    level: int
    progress: int

class TaskRequest(BaseModel):
    skills: List[Skill]

class ResumeRequest(BaseModel):
    username: str
    skills: List[Skill]
    projects: List[Dict[str, Any]]
    score: Optional[int] = 0

@app.get("/")
async def health_check():
    return {
        "status": "operational", 
        "protocol": "SkillGraph V1.0",
        "agents": ["Intelligence Architect", "Growth Strategy", "Identity Architect", "Strategic Overview", "Context Architect", "Venture Architect"]
    }

@app.post("/generate-description")
async def generate_description(request: ContextRequest):
    """
    Generates a professional project description using the Context Architect agent.
    """
    description = await generate_project_description_logic(request.name, request.context)
    return {"description": description}

@app.post("/analyze-project", dependencies=[Depends(check_rate_limit)])
async def analyze_project(request: RepoAnalysisRequest):
    """
    Analyzes a project's technical maturity and strategic impact deeply.
    """
    # Cybersecurity Sanitize
    sanitized_url = sanitize_input_text(request.repo_url or "")
    sanitized_desc = sanitize_input_text(request.project_description or "")
    
    name = "Unnamed Strategy"
    raw_content = ""
    
    if sanitized_url and "github.com" in sanitized_url:
        name = sanitized_url.split("/")[-1] or "Repository Profile"
        # Deep extraction instead of shallow README
        raw_content = await get_deep_github_content(sanitized_url)
        
    result = await analyze_project_logic(name, sanitized_desc, request.source_type, raw_content)
    return result

@app.post("/analyze-project-zip", dependencies=[Depends(check_rate_limit)])
async def analyze_project_zip(
    file: UploadFile = File(...),
    description: str = Form(default="")
):
    """
    Analyzes a ZIP-uploaded project archive by reading its file tree.
    """
    import zipfile
    from io import BytesIO

    sanitized_desc = sanitize_input_text(description)
    raw_content = ""
    name = file.filename.replace(".zip", "").replace("_", " ").replace("-", " ").title() if file.filename else "Uploaded Archive"

    try:
        zip_bytes = await file.read()
        with zipfile.ZipFile(BytesIO(zip_bytes)) as zf:
            file_list = zf.namelist()[:100]
            tree_lines = [f"- {f}" for f in file_list]
            raw_content = "=== UPLOADED ZIP ARCHIVE STRUCTURE ===\n" + "\n".join(tree_lines)

            # Try to read manifest files from the zip
            manifest_names = ["package.json", "requirements.txt", "go.mod", "Cargo.toml", "tsconfig.json"]
            for fname in file_list:
                base = fname.split("/")[-1]
                if base in manifest_names:
                    try:
                        with zf.open(fname) as mf:
                            content = mf.read(2000).decode("utf-8", errors="ignore")
                            raw_content += f"\n\n--- {fname} ---\n{content}"
                    except Exception:
                        pass
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ZIP extraction failed: {str(e)}")

    result = await analyze_project_logic(name, sanitized_desc, "ZIP", raw_content)
    return result

@app.post("/launch-venture", dependencies=[Depends(check_rate_limit)])
async def launch_venture(
    file: Optional[UploadFile] = File(None),
    repo_url: Optional[str] = Form(None)
):
    """
    Analyzes a startup idea (PDF) and MVP (GitHub) deeply using the Venture Architect.
    """
    idea_text = "No PDF idea provided."
    repo_content = "No repository context provided."
    
    # 1. Extract PDF Content Deeply
    if file:
        try:
            pdf_bytes = await file.read()
            reader = PdfReader(BytesIO(pdf_bytes))
            idea_text = ""
            # Iterate and read EVERY page
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    idea_text += page_text + "\n"
            
            # Secure against extremely large prompt injections
            idea_text = idea_text[:12000] 
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF extraction failed: {str(e)}")

    # 2. Extract Repo Content Deeply (Tree + manifest configs)
    if repo_url:
        sanitized_repo_url = sanitize_input_text(repo_url)
        if "github.com" in sanitized_repo_url:
            repo_content = await get_deep_github_content(sanitized_repo_url)

    # 3. Analyze via Venture Architect
    result = await analyze_venture_logic(idea_text, repo_content)
    return result

@app.post("/evolve-venture")
async def evolve_venture(request: Dict[str, Any]):
    """
    Generates non-stop new features for an existing project.
    """
    project_name = request.get("projectName", "Project")
    roadmap = request.get("roadmap", [])
    result = await evolve_venture_logic(project_name, json.dumps(roadmap))
    return result

@app.post("/generate-resume")
async def generate_full_resume(request: ResumeGenerationRequest):
    """
    Generates a professional ATS-optimized resume.
    """
    result = await generate_full_resume_logic(request.user_data, request.sections)
    return result

@app.post("/generate-tasks")
async def generate_tasks(request: TaskRequest):
    """
    Curates daily challenges using the Growth Strategy agent.
    """
    skill_profiles = ", ".join([f"{s.name} (Lvl {s.level})" for s in request.skills])
    result = await generate_tasks_logic(skill_profiles)
    return result

@app.post("/generate-resume-summary")
async def generate_resume_summary(request: ResumeRequest):
    """
    Crafts professional narratives using the Identity Architect agent.
    """
    skills_context = ", ".join([f"{s.name} (Level {s.level})" for s in request.skills])
    projects_context = ", ".join([f"{p.get('name')} ({p.get('difficulty')})" for p in request.projects])
    
    summary = await generate_identity_logic(request.username, skills_context, projects_context)
    return {"summary": summary}

@app.post("/dashboard-overview")
async def dashboard_overview(request: ResumeRequest):
    """
    Provides a high-level intelligence briefing using the Strategic Overview agent.
    """
    skills_context = ", ".join([f"{s.name} (Lvl {s.level})" for s in request.skills])
    briefing = await dashboard_overview_logic(request.username, request.score or 0, skills_context)
    return {"briefing": briefing}

class GenomapRequest(BaseModel):
    repo_url: str

@app.post("/genomap")
async def get_genomap(request: GenomapRequest):
    """
    Deconstructs a repository deeply into a highly specialized system DNA structure 
    using the advanced next-level Genome Architect AI Agent.
    """
    repo_url = request.repo_url or ""
    repo_path = ""
    if "github.com/" in repo_url:
        repo_path = repo_url.split("github.com/")[-1].strip("/")
    
    project_name = repo_path.split("/")[-1] if repo_path else "SkillGraph Project Node"
    commits_list = []
    raw_evidence = ""
    
    # 1. Fetch live code context and structural dependencies from GitHub
    if repo_path:
        try:
            # Get deep structural evidence (file tree structure + configuration manifests)
            raw_evidence = await get_deep_github_content(repo_url)
            
            token = os.getenv("GITHUB_TOKEN")
            headers = {"Authorization": f"token {token}"} if token else {}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"https://api.github.com/repos/{repo_path}/commits", headers=headers)
                if resp.status_code == 200:
                    raw_commits = resp.json()[:15] # Grab top 15 commits
                    for item in raw_commits:
                        commit_sha = item.get("sha", "")[:7]
                        commit_msg = item.get("commit", {}).get("message", "Update codebase structure")
                        author = item.get("commit", {}).get("author", {}).get("name", "Architect")
                        date = item.get("commit", {}).get("author", {}).get("date", "")
                        commits_list.append({
                            "sha": commit_sha,
                            "message": commit_msg,
                            "author": author,
                            "date": date
                        })
        except Exception as e:
            print(f"Error fetching commits from GitHub: {e}")

    # Fallback/Default dynamic sequence if GitHub fails or no repo_path provided
    if not commits_list:
        mock_messages = [
            ("e4b9c1d", "Refactor core database queries and optimize indexes", "Lead Architect", "2026-05-18T10:00:00Z"),
            ("d3a8f2c", "Implement JWT token encryption and secure route headers", "Security Auditor", "2026-05-18T09:12:00Z"),
            ("b7e9a4e", "Add high-frequency API rate limiter middleware", "SecOps Engineer", "2026-05-18T08:45:00Z"),
            ("f2c8d6b", "Write comprehensive unit test suites for resume parser", "QA Automation", "2026-05-18T08:00:00Z"),
            ("a9f1c5e", "Setup Docker config files and CI/CD GitHub action pipelines", "DevOps Engineer", "2026-05-18T07:30:00Z"),
            ("c3d7e8b", "Integrate Next.js state management and bento layouts", "Frontend Dev", "2026-05-18T06:15:00Z"),
            ("e9a1b2c", "Sanitize all text inputs against prompt overrides", "Security Auditor", "2026-05-18T05:00:00Z"),
            ("d4b6c8f", "Optimize Webpack asset loaders and bundle sizes", "Lead Architect", "2026-05-18T04:20:00Z"),
            ("a8f2e9c", "Setup main uvicorn server routes and CORS configurations", "DevOps Engineer", "2026-05-18T03:00:00Z"),
            ("b3d9c1a", "Deploy initial core project setup to staging", "QA Automation", "2026-05-18T02:10:00Z")
        ]
        for sha, msg, auth, dt in mock_messages:
            commits_list.append({
                "sha": sha,
                "message": msg,
                "author": auth,
                "date": dt
            })

    # 2. Invoke our advanced, next-level Genome Architect AI Agent
    result = await analyze_genome_logic(project_name, repo_url, commits_list, raw_evidence)
    return result

@app.post("/sync-profile")
async def sync_profile(request: Dict[str, Any]):
    username = request.get("username", "").lower()
    if not username:
        raise HTTPException(status_code=400, detail="Invalid username")
    
    profiles_file = "profiles.json"
    profiles = {}
    if os.path.exists(profiles_file):
        try:
            with open(profiles_file, "r") as f:
                profiles = json.load(f)
        except Exception:
            pass
    
    profiles[username] = request
    with open(profiles_file, "w") as f:
        json.dump(profiles, f, indent=4)
    
    return {"status": "success", "message": f"Profile {username} synced successfully."}

@app.get("/p/{username}")
async def get_profile(username: str):
    username_lower = username.lower()
    profiles_file = "profiles.json"
    if os.path.exists(profiles_file):
        try:
            with open(profiles_file, "r") as f:
                profiles = json.load(f)
            if username_lower in profiles:
                return profiles[username_lower]
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Profile not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
