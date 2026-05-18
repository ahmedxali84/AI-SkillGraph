import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from agents.intelligence_architect import analyze_project_logic

async def main():
    try:
        print("Testing analyze_project_logic...")
        result = await analyze_project_logic("Test Project", "A simple test description", "Manual")
        print("Result:", result)
    except Exception as e:
        print("Error occurred:", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
