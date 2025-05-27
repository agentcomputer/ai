# agent_computer_demo.py

import time

from comms_hub_ai import extract_feature_ideas_from_chat
from task_manager_ai import breakdown_feature_into_tasks, suggest_sub_tasks_for_task
from presentation_builder_ai import generate_presentation_outline

def print_header(title: str):
    """Prints a formatted header."""
    print(f"\n{'=' * 60}")
    print(f"|| {title.center(54)} ||")
    print(f"{'=' * 60}\n")
    time.sleep(1)

def print_user_action(action: str):
    """Formats and prints a user action."""
    print(f"USER: \"{action}\"")
    time.sleep(1.5)

def print_gemini_response(response_intro: str, items: list[str] = None, is_list: bool = True):
    """Formats and prints Gemini's response."""
    print(f"\nGEMINI: \"{response_intro}\"")
    if items:
        if is_list:
            for i, item in enumerate(items, 1):
                print(f"  {i}. {item}")
                time.sleep(0.5)
        else: # For non-list items or general text
            for item in items:
                print(f"  {item}")
                time.sleep(0.5)
    print("") # Extra newline for spacing
    time.sleep(1)

def main_demo():
    """Runs the main Agent Computer demo narrative."""

    # --- Introduction ---
    print_header("Welcome to the Agent Computer Demo!")
    print("We'll demonstrate how AI (Gemini) can collaborate with a user to plan a new product feature,")
    print("from brainstorming through to generating a presentation outline.")
    print("This is a simulation using pre-defined AI responses to showcase the workflow.")
    input("\nPress Enter to continue...")

    # --- Part 1: Comms Hub - Brainstorming & Idea Extraction ---
    print_header("Stage 1: Comms Hub (Brainstorming)")

    mock_chat_log = """
    Alice: Hey team, I'm finding it hard to keep track of action items from our chats.
    Bob: I agree! Messages just get buried. Maybe we could flag messages as tasks?
    Charlie: Or a way to categorize conversations by project? That would help too.
    Alice: Good idea, Charlie! And what about important dates? I missed that meeting reminder yesterday.
    Bob: Oh, a calendar view or integration would be amazing.
    David: I also think the notifications are a bit much. Can we customize them?
    Alice: Yes, like only get notified for direct mentions in some chats.
    """
    print_user_action("Pastes the following chat discussion into the Comms Hub:")
    print("-------------------- CHAT LOG START --------------------")
    print(mock_chat_log.strip())
    print("--------------------- CHAT LOG END ---------------------")
    time.sleep(2)

    feature_ideas = extract_feature_ideas_from_chat(mock_chat_log)
    # As per comms_hub_ai.py, the simulated response is:
    # 1. Message tagging or categorization system.
    # 2. Enhanced notification preferences for different chat types.
    # 3. Calendar integration for scheduling discussed events.

    print_gemini_response("Analyzing the discussion... Here are some potential feature ideas I found:", feature_ideas)

    selected_feature_idea = "Default Feature Idea if extraction fails"
    if feature_ideas:
        selected_feature_idea = feature_ideas[0] # Assume user picks the first one
    
    print_user_action(f"Great, let's proceed with: '{selected_feature_idea}'")
    input("\nPress Enter to continue...")

    # --- Part 2: Task Manager - Planning & Task Breakdown ---
    print_header("Stage 2: Task Manager (Planning)")
    print_user_action(f"Okay Gemini, let's create a project plan for '{selected_feature_idea}'.")

    # The selected_feature_idea will be "Message tagging or categorization system."
    # The task_manager_ai.breakdown_feature_into_tasks has a hardcoded response for
    # "AI-powered In-Chat Meeting Scheduler & Summarizer".
    # For this demo to be more coherent, we'll use the feature idea that breakdown_feature_into_tasks
    # is hardcoded to respond to, as if the user had selected that from the chat.
    # This means the `selected_feature_idea` from Part 1 won't perfectly match the input for Part 2's AI call,
    # but the narrative will be smoother given the hardcoded AI responses.

    # Let's use the feature idea task_manager_ai.py is built for:
    task_manager_feature_input = "AI-powered In-Chat Meeting Scheduler & Summarizer"
    # And adjust the narrative slightly for this specific demo context
    print(f"(Narrator: For a richer task breakdown, let's assume the user refined their idea to: '{task_manager_feature_input}')")
    print_user_action(f"Okay Gemini, let's create a project plan for '{task_manager_feature_input}'.")
    time.sleep(1)


    high_level_tasks = breakdown_feature_into_tasks(task_manager_feature_input)
    # Expected tasks based on task_manager_ai.py:
    # 1. Design and integrate natural language processing (NLP) for understanding scheduling requests and chat content.
    # 2. Develop calendar integration module for checking availability and booking meetings.
    # 3. Implement AI model for chat summarization to identify key discussion points and action items.
    # 4. Create user interface elements for initiating scheduling, viewing summaries, and managing settings.
    # 5. Build backend infrastructure to support asynchronous processing of summarization and scheduling tasks.

    print_gemini_response(f"Okay, I've broken down '{task_manager_feature_input}' into these high-level tasks:", high_level_tasks)

    chosen_high_level_task = ""
    if high_level_tasks:
        # Let's pick the task for which suggest_sub_tasks_for_task is hardcoded
        # which is "Implement AI model for chat summarization to identify key discussion points and action items." (typically the 3rd one)
        for task in high_level_tasks:
            if "chat summarization" in task:
                chosen_high_level_task = task
                break
        if not chosen_high_level_task: # Fallback
            chosen_high_level_task = high_level_tasks[2] if len(high_level_tasks) > 2 else high_level_tasks[0]


    if chosen_high_level_task:
        print_user_action(f"Can you suggest some sub-tasks for: '{chosen_high_level_task}'?")
        sub_tasks = suggest_sub_tasks_for_task(chosen_high_level_task)
        # Expected sub-tasks based on task_manager_ai.py:
        # - Research and select appropriate pre-trained summarization models (e.g., T5, BART).
        # - Fine-tune selected model on a dataset of representative chat conversations.
        # - Develop an API endpoint for the summarization service.
        # - Integrate the summarization API with the main application chat interface.
        print_gemini_response("Certainly! Here are some sub-tasks:", sub_tasks, is_list=True) # sub-tasks are bulleted in source
    
    input("\nPress Enter to continue...")

    # --- Part 3: Presentation Builder - Outline Generation ---
    print_header("Stage 3: Presentation Builder (Outline)")
    # For presentation, we'll use the task_manager_feature_input and its high_level_tasks
    # because presentation_builder_ai.py's simulated response is also somewhat generic but
    # using the more complex feature idea makes for a better presentation example.
    
    print_user_action(f"Now, I need to prepare a stakeholder update for '{task_manager_feature_input}'. Can you draft a presentation outline?")

    presentation_outline = generate_presentation_outline(task_manager_feature_input, high_level_tasks)
    # Expected slide titles based on presentation_builder_ai.py (it uses a different example, so output will be from its hardcoded response):
    # 1. Igniting Culinary Creativity: Introducing Your Personal AI Recipe Chef
    # 2. The Daily Dilemma: What's for Dinner? (And Why It's Hard)
    # 3. Solution on the Menu: The AI-Powered Recipe Recommendation Engine
    # 4. Taste the Future: Key Features & Personalized Benefits
    # 5. From Concept to Kitchen: Our Development Journey
    # 6. Beyond the Recipe: Expanding Your Culinary Horizons
    # 7. Questions & Open Kitchen Discussion
    # Note: The simulated response in presentation_builder_ai.py is for "AI-Powered Recipe Recommendation Engine".
    # This demo highlights the flow; the content alignment between Gemini's different "brains" is simplified.
    print("(Narrator: Gemini will use its presentation generation expertise. The input feature idea and tasks will guide it, but the example output is pre-set for a different topic to show a typical structure.)")
    time.sleep(2)

    print_gemini_response("Here's a draft presentation outline based on the feature and our task plan:", presentation_outline)
    input("\nPress Enter to continue...")

    # --- Conclusion ---
    print_header("Demo Complete!")
    print("As you saw, Gemini (simulated) collaborated with the user throughout the workflow:")
    print("- Assisting with idea generation in the Comms Hub.")
    print("- Helping with task breakdown and sub-task suggestion in the Task Manager.")
    print("- Drafting a presentation outline in the Presentation Builder.")
    print("\nThis illustrates the 'Agent Computer' concept where AI acts as a helpful partner,")
    print("integrating across different tools and stages of a project.")
    print("\nThank you for watching!")

if __name__ == '__main__':
    main_demo()
