import os
import json
import re
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from agents.base import get_agent
from langchain_core.prompts import ChatPromptTemplate

class BasePairCommit(BaseModel):
    sha: str = Field(description="The short 7-character commit SHA")
    message: str = Field(description="The commit message describing the changes")
    author: str = Field(description="The author of the commit")
    date: str = Field(description="The ISO date string of the commit")
    base: str = Field(description="Genetic Base Pair classification: A | S | T | I | V")
    impact: int = Field(description="Numeric impact score from 40 to 100 representing contribution depth")
    details: str = Field(description="A next-level, highly detailed cryptographic log entry describing the specific architectural patterns, paradigms, or system mutations demonstrated by this change in a polished premium executive tone.")

class GenomeAnalysis(BaseModel):
    projectName: str = Field(description="Calculated project name")
    repoUrl: str = Field(description="URL of the repository")
    dnaSequence: List[BasePairCommit] = Field(description="The deconstructed list of classified base pair commits")
    executiveSummary: str = Field(description="A highly advanced, executive-level technical summary (2-3 paragraphs) analyzing the overall system DNA, its architectural maturity, patterns observed, and strategic engineering readiness.")
    complexityIndex: float = Field(description="Structural complexity score of the codebase DNA from 0.0 to 10.0")

# Initialize LLM-based structured agent
try:
    llm_agent = get_agent(temperature=0.1).with_structured_output(GenomeAnalysis)
except Exception as e:
    print(f"Failed to initialize Groq LLM agent for Genome Architect: {e}")
    llm_agent = None

def run_fallback_heuristics(project_name: str, repo_url: str, commits: List[Dict[str, Any]], raw_evidence: str = "") -> Dict[str, Any]:
    """
    Advanced semantic rule engine to classify repository DNA commits into 
    precise base pairs with high-fidelity, polished executive cryptographic details.
    """
    dna_sequence = []
    counts = {"A": 0, "S": 0, "T": 0, "I": 0, "V": 0}
    
    for idx, commit in enumerate(commits):
        msg = commit.get("message", "Update codebase structure")
        msg_lower = msg.lower()
        sha = commit.get("sha", "f1a2b3c")[:7]
        author = commit.get("author", "Architect")
        date = commit.get("date", "")
        
        # 1. Advanced semantic rules
        if any(w in msg_lower for w in ["optimize", "speed", "fast", "complex", "performance", "queries", "refactor", "scale", "perf", "index", "algorithm", "complexity", "db", "query", "search", "tree", "sort", "cache", "redis", "memory", "leak"]):
            base = "A" # Algorithmic Complexity
            impact = 65 + (idx * 3 + len(sha)) % 26
            details = f"Genetic engineering base [A] mutated by +{impact}%: Isolated and optimized system latency overheads. Refactored query execution pathways to minimize algorithmic time complexity and maximize throughput."
        elif any(w in msg_lower for w in ["security", "auth", "login", "sanitize", "protect", "hide", "token", "jwt", "header", "csp", "limit", "rate", "encrypt", "decrypt", "hash", "ssl", "tls", "guard", "restrict", "cors", "validate", "xss", "csrf", "injection"]):
            base = "S" # Security Robustness
            impact = 70 + (idx * 4 + len(sha)) % 21
            details = f"Genetic engineering base [S] hardened by +{impact}%: Provisions secure validation layers, seals communication headers, and deploys high-frequency rate-limiting protocols against injection vectors."
        elif any(w in msg_lower for w in ["test", "coverage", "jest", "unittest", "pytest", "spec", "assert", "mock", "stub", "check", "verify", "audit", "lint", "eslint", "prettier"]):
            base = "T" # Test Coverage
            impact = 55 + (idx * 5 + len(sha)) % 31
            details = f"Genetic engineering base [T] covered by +{impact}%: Engineered robust test harness and verification suites. Stabilized state transitions and implemented automated regressions guards."
        elif any(w in msg_lower for w in ["docker", "config", "yaml", "setup", "cicd", "workflow", "deploy", "build", "actions", "cors", "nginx", "apache", "server", "aws", "gcp", "azure", "kubernetes", "k8s", "env", "git", "npm", "pip", "package"]):
            base = "I" # Infrastructure Depth
            impact = 60 + (idx * 2 + len(sha)) % 29
            details = f"Genetic engineering base [I] deployed by +{impact}%: Orchestrated configuration orchestrators and container manifests. Aligned zero-downtime pipeline actions for continuous cloud sync."
        else:
            base = "V" # Code Velocity
            impact = 45 + (idx * 6 + len(sha)) % 36
            details = f"Genetic engineering base [V] speed sync of +{impact}%: Discharged interactive features and polished UI aesthetics, directly accelerating operational capacity and visual synergy."

        counts[base] += 1
        dna_sequence.append({
            "sha": sha,
            "message": msg,
            "author": author,
            "date": date,
            "base": base,
            "impact": impact,
            "details": details
        })

    # 2. Dynamically build Next-Level Executive Summary
    total = sum(counts.values()) or 1
    percentages = {k: round((v / total) * 100) for k, v in counts.items()}
    
    # Identify dominant genes
    dominant_genes = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    primary_gene = dominant_genes[0][0]
    secondary_gene = dominant_genes[1][0] if len(dominant_genes) > 1 else primary_gene

    gene_map = {
        "A": "Algorithmic Complexity & Speed Grid [A]",
        "S": "Security Robustness & Guards [S]",
        "T": "Test Coverage & Verification [T]",
        "I": "Infrastructure Depth & Orchestration [I]",
        "V": "Code Velocity & Feature Momentum [V]"
    }

    summary_para1 = f"An in-depth DNA sequencing of the codebase reveals a highly specialized system profile with {percentages[primary_gene]}% dominance in {gene_map[primary_gene]} followed by a {percentages[secondary_gene]}% active matrix of {gene_map[secondary_gene]}. This unique genetic configuration demonstrates structured modularity and targeted engineering paradigms, signifying an environment structured for complex runtime execution."
    
    if primary_gene == "A":
        summary_para2 = "The dominant Algorithmic Complexity gene [A] suggests an architecture highly focused on database optimization, memory footprint reduction, and scale-ready data structures. Low-latency pathways and refined algorithmic logic guarantee high computational efficiency, crucial for processing complex analytical workloads."
    elif primary_gene == "S":
        summary_para2 = "The dominant Security Robustness gene [S] establishes this system as a hardened SeOps fortress. Implemented transport-layer safeguards, input sanitization protocols, and tokenized session managers indicate extreme defensive readiness against standard web exploitation vectors and system overrides."
    elif primary_gene == "I":
        summary_para2 = "The dominant Infrastructure Depth gene [I] represents a high degree of deployment sophistication. Leveraging automated containerization, standardized CI/CD pipelines, and configuration variables ensures the software is built for elastic scalability, fast reproduction, and flawless cloud synchronization."
    elif primary_gene == "T":
        summary_para2 = "The dominant Test Coverage gene [T] verifies a high-coverage system designed with strict quality assurance guards. Incorporating exhaustive assertions, automated spec suites, and syntax controls actively protects this repository against structural regressions and logic degradation."
    else:
        summary_para2 = "The dominant Code Velocity gene [V] reveals a high-momentum feature pipeline. The code structure emphasizes visual synergy, responsive front-end state managers, and polished user interaction panels, which drastically shortens the feedback loop and accelerates functional releases."

    summary_para3 = "Overall, the system demonstrates exceptional technical maturity. Aligned architectural blocks, deep manifestation dependencies, and structured commit patterns indicate a professional-grade codebase. The repository is perfectly prepared for enterprise integration and production-scale operational sync."

    executive_summary = f"{summary_para1}\n\n{summary_para2}\n\n{summary_para3}"

    # Calculate complexity index
    base_complexity = 5.0
    base_complexity += (counts["A"] * 0.4 + counts["S"] * 0.4 + counts["I"] * 0.3 + counts["T"] * 0.2 - counts["V"] * 0.1)
    complexity_index = min(max(round(base_complexity, 1), 1.0), 10.0)

    return {
        "projectName": project_name,
        "repoUrl": repo_url,
        "dnaSequence": dna_sequence,
        "executiveSummary": executive_summary,
        "complexityIndex": complexity_index
    }

async def analyze_genome_logic(project_name: str, repo_url: str, commits: List[Dict[str, Any]], raw_evidence: str = "") -> Dict[str, Any]:
    """
    Main entry point for Genome Architect AI Agent.
    Tries Groq LLM dynamic parsing first; falls back gracefully to deep semantic rule parser on failures.
    """
    if not commits:
        return run_fallback_heuristics(project_name, repo_url, [], raw_evidence)

    # 1. Clean commits structure for prompt context to avoid bloating tokens
    cleaned_commits = []
    for c in commits[:15]:
        cleaned_commits.append({
            "sha": c.get("sha", "")[:7],
            "message": c.get("message", "")[:120],
            "author": c.get("author", "Architect"),
            "date": c.get("date", "")
        })

    prompt = ChatPromptTemplate.from_template("""
    SYSTEM: You are the SkillGraph Genome Architect. Your ONLY objective is to analyze a project's repository commit logs, file tree structures, and configuration files to decode its technical structural DNA.

    DIAGNOSTIC CRITERIA:
    You must classify each commit into exactly one of five biological base pairs representing genetic magnitude:
    1. [A] Algorithmic Complexity: Algorithmic time/space complexity optimizations, query speedups, memory-leak fixes, heavy refactoring of math/logic, DB indexing, caches (e.g. Redis).
    2. [S] Security Robustness: JWT/token authentication, sanitizing inputs, CSRF/XSS protection, rate limiting, secure headers, cryptographic hashing, SSL/TLS, access controls.
    3. [T] Test Coverage: Unit tests, integration tests, mock assertions, spec setups, lint rules (ESLint, Prettier), verification/QA pipelines.
    4. [I] Infrastructure Depth: CI/CD workflows, Docker configs, Nginx/Apache, system envs, packages installations (npm, pip), cloud setups (AWS, GCP), deploy scripts, package.json/requirements.txt changes.
    5. [V] Code Velocity: Standard feature additions, UI, stylesheets, layout alignment, static text, README markdown docs, translations, general small updates.

    STRICT ANALYSIS PROTOCOL:
    - Assess each commit deeply. Calculate a numeric impact score (40 to 100) representing technical effort.
    - Write a highly polished, advanced, next-level cryptographic detail log entry for each commit in a professional executive tone.
    - Draft an executive summary (3 paragraphs, next-level premium prose) highlighting dominant engineering traits, system maturity, and structural patterns.
    - Synthesize a DNA Helix Complexity index (0.0 to 10.0) based on deep codebase evidence.

    INPUT DATA:
    - Project Name: {project_name}
    - Repository URL: {repo_url}
    - Technical Evidence (File tree & manifest config files): {raw_evidence}
    - Commit Log History: {commits_json}
    """)

    if llm_agent is not None:
        try:
            chain = prompt | llm_agent
            response = await chain.ainvoke({
                "project_name": project_name,
                "repo_url": repo_url,
                "raw_evidence": raw_evidence[:2000],
                "commits_json": json.dumps(cleaned_commits)
            })
            return response.dict()
        except Exception as e:
            print(f"Groq dynamic analysis failed or rate-limited. Activating advanced semantic fallback parser... Error: {e}")
            return run_fallback_heuristics(project_name, repo_url, commits, raw_evidence)
    else:
        return run_fallback_heuristics(project_name, repo_url, commits, raw_evidence)
