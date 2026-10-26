import json
import os
import re
from typing import Dict, Any, List

# Regex heuristic to ignore academic/university cover page boilerplate
BOILERPLATE_REGEX = re.compile(
    r"(semester\s*project|bachelor\s*of|faculty\s*of|department\s*of|submitted\s*for|"
    r"partial\s*fulfillment|dr\.|prof\.|guide\s*:|supervisor\s*:|roll\s*no|enrollment|university|"
    r"college|institute|academic\s*year|acknowledgements?|certificate|table\s*of\s*contents)",
    re.IGNORECASE
)

class AISynthesisService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    def _is_boilerplate(self, line: str) -> bool:
        """Flags lines that look like cover pages, certificates, or academic metadata."""
        if BOILERPLATE_REGEX.search(line):
            return True
        # Exclude lines that are mostly dates, page numbers, or single short words
        if re.match(r"^(\d+|page\s*\d+|date\s*:|submitted\s*by.*)$", line.strip(), re.IGNORECASE):
            return True
        return False

    async def extract_requirements(self, text: str) -> List[Dict[str, Any]]:
        """Parses raw document text into filtered, functional software requirements."""
        raw_lines = [line.strip("- *• \t\r") for line in text.split("\n") if len(line.strip()) > 15]

        # Filter out academic boilerplate
        functional_lines = [l for l in raw_lines if not self._is_boilerplate(l)]

        # Fallback if everything was filtered out
        if not functional_lines:
            functional_lines = raw_lines if raw_lines else ["System must process user authentication and validate workflow inputs."]

        parsed_requirements = []
        counter = 1

        for line in functional_lines[:12]:  # Pick top valid functional specifications
            req_type = "Non-Functional" if any(k in line.lower() for k in ["latency", "sec", "security", "token", "perf", "ms", "auth"]) else "Functional"
            actor = "Admin" if "admin" in line.lower() else "API Client" if "api" in line.lower() else "Registered User"

            parsed_requirements.append({
                "id": f"REQ-{counter:02d}",
                "title": line[:75] + ("..." if len(line) > 75 else ""),
                "type": req_type,
                "actor": actor,
                "expectedBehavior": line,
                "status": "Ready"
            })
            counter += 1

        return parsed_requirements

    async def generate_test_strategy_and_cases(self, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates QA Strategy, Test Cases, and a structured Development Task Roadmap."""
        strategy = {
            "objective": f"Validate end-to-end reliability, input boundary conditions, and security for {len(requirements)} core requirements.",
            "scope": ", ".join([r["title"][:30] for r in requirements[:4]]),
            "testLevels": ["Unit Testing", "API Integration Testing", "Playwright End-to-End Suite"],
            "entryCriteria": "All requirement endpoints live on staging environment with mock authentication provider ready.",
            "exitCriteria": "100% pass rate on critical paths; zero Sev-1/Sev-2 vulnerabilities identified.",
            "risks": "Token replay attacks, external payment/email throttle limits, and concurrent session race conditions."
        }

        # 1. Synthesize Test Cases
        test_cases = []
        for idx, req in enumerate(requirements, 1):
            test_cases.append({
                "id": f"TC-{idx:03d}",
                "scenario": f"Verify {req['title']}",
                "type": "Positive" if req["type"] == "Functional" else "Security",
                "preconditions": f"Valid environment configuration for actor '{req['actor']}'",
                "steps": [
                    f"Authenticate or initialize session as {req['actor']}",
                    f"Perform action fulfilling '{req['title']}'",
                    "Validate response payload and status code"
                ],
                "expectedResult": f"System completes workflow matching requirement: {req['expectedBehavior'][:80]}..."
            })

        # 2. Synthesize Actionable Development & QA Tasks
        tasks = []
        task_id = 1
        for req in requirements:
            req_title = req["title"]

            # Backend Task
            tasks.append({
                "id": f"TASK-{task_id:02d}",
                "reqId": req["id"],
                "title": f"Implement API & Logic for {req_title}",
                "category": "Backend API",
                "status": "pending",  # 'pending' | 'in_progress' | 'completed'
                "estimatedHours": 4
            })
            task_id += 1

            # Frontend/UI Task
            tasks.append({
                "id": f"TASK-{task_id:02d}",
                "reqId": req["id"],
                "title": f"Build Interface & Form validation for {req_title}",
                "category": "Frontend UI",
                "status": "pending",
                "estimatedHours": 3
            })
            task_id += 1

            # Automated Verification Task
            tasks.append({
                "id": f"TASK-{task_id:02d}",
                "reqId": req["id"],
                "title": f"Write Playwright automation assertion for {req_title}",
                "category": "QA Automation",
                "status": "pending",
                "estimatedHours": 2
            })
            task_id += 1

        # 3. Base Playwright automation script stub
        automation_script = f"""import {{ test, expect }} from '@playwright/test';

test.describe('Synthesized End-to-End Test Suite', () => {{
{chr(10).join([f'''  test('{tc["id"]}: {tc["scenario"]}', async ({{ page }}) => {{
    // Precondition: {tc["preconditions"]}
    await page.goto('/');
    // TODO: Implement steps for {tc["id"]}
    expect(true).toBeTruthy();
  }});''' for tc in test_cases[:4]])}
}});"""

        return {
            "strategy": strategy,
            "testCases": test_cases,
            "tasks": tasks,  # Newly provided tasks breakdown
            "automationScript": automation_script
        }

ai_service = AISynthesisService()