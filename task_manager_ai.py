# task_manager_ai.py

import re

# Aware of demo_models.ProjectTask, e.g., ProjectTask(task_name: str, sub_tasks: list[str], status: str)
# Aware of comms_hub_ai.py for how feature ideas might be generated.

def breakdown_feature_into_tasks(feature_idea: str) -> list[str]:
    """
    Simulates using Gemini to break down a feature idea into high-level tasks.
    """

    # 1. Prompt Engineering for breaking down a feature
    prompt_to_gemini_for_feature = f"""
    Analyze the following product feature idea and generate a list of 3-5 distinct,
    high-level project tasks required to implement it.
    Present these tasks as a clearly formatted numbered list, each task on a new line.

    Feature Idea: "{feature_idea}"

    High-level tasks:
    """

    # 2. Simulate Gemini's Response for feature breakdown
    # This is a hardcoded example based on `sample_feature_idea` in `if __name__ == '__main__'`
    # If feature_idea is "AI-powered In-Chat Meeting Scheduler & Summarizer"
    simulated_gemini_response_feature = """
    Okay, here are the high-level tasks for "AI-powered In-Chat Meeting Scheduler & Summarizer":
    1. Design and integrate natural language processing (NLP) for understanding scheduling requests and chat content.
    2. Develop calendar integration module for checking availability and booking meetings.
    3. Implement AI model for chat summarization to identify key discussion points and action items.
    4. Create user interface elements for initiating scheduling, viewing summaries, and managing settings.
    5. Build backend infrastructure to support asynchronous processing of summarization and scheduling tasks.
    """
    # In a real scenario: actual_response = call_gemini_api(prompt_to_gemini_for_feature)
    # For now, use the simulated response.

    # 3. Parsing the simulated response for feature tasks
    tasks = []
    # Regex to find lines starting with a number, a period, and a space
    matches = re.findall(r"^\s*\d+\.\s+(.+)", simulated_gemini_response_feature, re.MULTILINE)
    if matches:
        for match in matches:
            tasks.append(match.strip())
    return tasks

def suggest_sub_tasks_for_task(high_level_task: str) -> list[str]:
    """
    (Optional Stretch Goal) Simulates using Gemini to suggest sub-tasks for a high-level task.
    """

    # 1. Prompt Engineering for suggesting sub-tasks
    prompt_to_gemini_for_subtasks = f"""
    Given the following high-level project task, break it down into 2-4 specific sub-tasks.
    Present these sub-tasks as a clearly formatted bulleted or dashed list, each on a new line.

    High-Level Task: "{high_level_task}"

    Sub-tasks:
    """

    # 2. Simulate Gemini's Response for sub-tasks
    # This is a hardcoded example. Let's assume high_level_task is
    # "Implement AI model for chat summarization to identify key discussion points and action items."
    simulated_gemini_response_subtasks = """
    Understood. Here are some sub-tasks for "Implement AI model for chat summarization to identify key discussion points and action items":
    - Research and select appropriate pre-trained summarization models (e.g., T5, BART).
    - Fine-tune selected model on a dataset of representative chat conversations.
    - Develop an API endpoint for the summarization service.
    - Integrate the summarization API with the main application chat interface.
    """
    # In a real scenario: actual_response = call_gemini_api(prompt_to_gemini_for_subtasks)
    # For now, use the simulated response.

    # 3. Parsing the simulated response for sub-tasks
    sub_tasks = []
    # Regex to find lines starting with a dash or bullet (optional space)
    # It will capture the text after "- " or "* "
    matches = re.findall(r"^\s*[-\*\u2022]\s+(.+)", simulated_gemini_response_subtasks, re.MULTILINE)
    if matches:
        for match in matches:
            sub_tasks.append(match.strip())
    return sub_tasks

if __name__ == '__main__':
    sample_feature_idea = "AI-powered In-Chat Meeting Scheduler & Summarizer"
    print(f"Feature Idea: {sample_feature_idea}")

    print("\n--- Breaking down feature into high-level tasks (Simulated Gemini) ---")
    high_level_tasks = breakdown_feature_into_tasks(sample_feature_idea)

    if high_level_tasks:
        for i, task in enumerate(high_level_tasks, 1):
            print(f"{i}. {task}")

        # (Optional Stretch Goal) Demonstrate sub-task suggestion
        if high_level_tasks: # Ensure there's at least one task to pick
            # Pick the third task for sub-task generation, as the simulated response is tailored for it.
            # The simulated response for sub-tasks is hardcoded for:
            # "Implement AI model for chat summarization to identify key discussion points and action items."
            # which is the 3rd task in the simulated high_level_tasks list.
            task_to_breakdown_further = None
            for task in high_level_tasks:
                if "chat summarization" in task: # A bit fragile, but good for demo
                    task_to_breakdown_further = task
                    break
            
            if not task_to_breakdown_further and high_level_tasks:
                task_to_breakdown_further = high_level_tasks[2] # Fallback to the 3rd task

            if task_to_breakdown_further:
                print(f"\n--- Suggesting sub-tasks for: \"{task_to_breakdown_further}\" (Simulated Gemini) ---")
                sub_tasks = suggest_sub_tasks_for_task(task_to_breakdown_further)
                if sub_tasks:
                    for j, sub_task in enumerate(sub_tasks, 1):
                        print(f"  - {sub_task}")
                else:
                    print("No sub-tasks were suggested (or parsing failed).")
            else:
                print("\nCould not select a high-level task to break down further.")
    else:
        print("No high-level tasks were generated (or parsing failed).")

    # Test with another feature idea to show that the prompt is dynamic,
    # though the response from breakdown_feature_into_tasks will be the same (hardcoded).
    print("\n--- Testing with a different feature idea (Note: response is still hardcoded) ---")
    another_feature_idea = "Gamified User Onboarding Experience"
    print(f"Feature Idea: {another_feature_idea}")
    # The prompt passed to breakdown_feature_into_tasks *would* use this new idea.
    # The simulated response *inside* the function is static, however.
    tasks_for_another_feature = breakdown_feature_into_tasks(another_feature_idea)
    if tasks_for_another_feature:
        for i, task in enumerate(tasks_for_another_feature, 1):
            print(f"{i}. {task}")
    else:
        print("No high-level tasks were generated.")

    # Test the sub-task function with a different high-level task
    # (Note: response from suggest_sub_tasks_for_task is also hardcoded)
    print("\n--- Testing sub-task suggestion with a different high-level task (Note: response is still hardcoded) ---")
    another_high_level_task = "Develop image processing pipeline."
    print(f"High-Level Task: {another_high_level_task}")
    sub_tasks_for_another_task = suggest_sub_tasks_for_task(another_high_level_task)
    if sub_tasks_for_another_task:
        for j, sub_task in enumerate(sub_tasks_for_another_task, 1):
            print(f"  - {sub_task}")
    else:
        print("No sub-tasks were suggested.")
