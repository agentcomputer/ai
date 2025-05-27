# presentation_builder_ai.py

import re

# Aware of demo_models.PresentationSlide (e.g., PresentationSlide(slide_title: str, bullet_points: list[str]))
# Aware of how feature ideas might come from comms_hub_ai.py
# Aware of how task lists might come from task_manager_ai.py

def generate_presentation_outline(feature_idea: str, task_list: list[str]) -> list[str]:
    """
    Simulates using Gemini to generate a presentation outline (list of slide titles)
    based on a feature idea and a list of high-level tasks.
    """

    # 1. Prompt Engineering
    # Convert task_list into a string for the prompt
    tasks_string = "\n".join([f"- {task}" for task in task_list])

    prompt_to_gemini = f"""
    I need to create a presentation for a new product feature.
    Please generate a list of 5-7 relevant and engaging slide titles for this presentation.
    The presentation should have a logical flow, such as:
    1.  Introduction/Hook
    2.  Problem Statement
    3.  Introducing the Solution (our feature)
    4.  Key Aspects/Benefits of the Feature
    5.  How it Works / Key Project Phases (incorporating the provided tasks)
    6.  Call to Action / Next Steps / Q&A

    Product Feature Idea:
    "{feature_idea}"

    High-Level Project Tasks:
    {tasks_string}

    Please return *only* the slide titles as a numbered list, each on a new line.
    For example:
    1. Title for Slide 1
    2. Title for Slide 2
    ...
    """

    # 2. Simulate Gemini's Response
    # This is a hardcoded example based on the sample_feature_idea and sample_task_list
    # in the `if __name__ == '__main__'` block.
    # Feature: "AI-Powered Recipe Recommendation Engine"
    # Tasks:
    # - "Develop user profiling module for dietary preferences."
    # - "Integrate with external recipe databases."
    # - "Build and train recipe scoring algorithm."
    # - "Design user interface for recipe discovery and meal planning."

    simulated_gemini_response = f"""
    Okay, based on the feature "{feature_idea}" and the provided tasks, here's a suggested presentation outline:

    1.  Igniting Culinary Creativity: Introducing Your Personal AI Recipe Chef
    2.  The Daily Dilemma: What's for Dinner? (And Why It's Hard)
    3.  Solution on the Menu: The AI-Powered Recipe Recommendation Engine
    4.  Taste the Future: Key Features & Personalized Benefits
    5.  From Concept to Kitchen: Our Development Journey (Tasks: User Profiling, Database Integration, Algorithm Training, UI Design)
    6.  Beyond the Recipe: Expanding Your Culinary Horizons
    7.  Questions & Open Kitchen Discussion
    """
    # In a real scenario: actual_response = call_gemini_api(prompt_to_gemini)
    # For now, use the simulated response.

    # 3. Parsing: Extract slide titles from the simulated response
    slide_titles = []
    # Regex to find lines starting with a number, a period, and a space,
    # and capture the text after that.
    # We also want to make sure we don't capture the "Tasks: ..." part if it's on the same line,
    # so we'll specifically stop before an opening parenthesis that might denote a list of tasks.
    # A more robust way is to first get the full line, then strip the task part.

    # Initial match for numbered list items
    matches = re.findall(r"^\s*\d+\.\s+(.+)", simulated_gemini_response, re.MULTILINE)
    if matches:
        for title_candidate in matches:
            # Remove any trailing parenthetical task list (like "(Tasks: ...)")
            cleaned_title = re.sub(r"\s*\(Tasks:.*\)\s*$", "", title_candidate)
            slide_titles.append(cleaned_title.strip())
            
    return slide_titles

if __name__ == '__main__':
    sample_feature_idea = "AI-Powered Recipe Recommendation Engine"
    sample_task_list = [
        "Develop user profiling module for dietary preferences.",
        "Integrate with external recipe databases.",
        "Build and train recipe scoring algorithm.",
        "Design user interface for recipe discovery and meal planning."
    ]

    print(f"Feature Idea: {sample_feature_idea}")
    print("Task List:")
    for task in sample_task_list:
        print(f"- {task}")

    print("\n--- Generating Presentation Outline (Simulated Gemini) ---")
    presentation_titles = generate_presentation_outline(sample_feature_idea, sample_task_list)

    if presentation_titles:
        print("\nSuggested Presentation Slide Titles:")
        for i, title in enumerate(presentation_titles, 1):
            print(f"{i}. {title}")
    else:
        print("No slide titles were generated (or parsing failed).")

    # Test with a different feature idea and task list
    sample_feature_idea_2 = "Secure Cloud Document Editor with Real-time Collaboration"
    sample_task_list_2 = [
        "Develop core document editing engine.",
        "Implement real-time synchronization logic.",
        "Build robust security and encryption layers.",
        "Design intuitive user interface for collaboration features."
    ]
    print(f"\n\nFeature Idea: {sample_feature_idea_2}")
    print("Task List:")
    for task in sample_task_list_2:
        print(f"- {task}")
    print("\n--- Generating Presentation Outline (Simulated Gemini for 2nd example) ---")
    # NOTE: The simulated_gemini_response inside the function is currently STATIC and tailored
    # to the FIRST example. So, this second call will still use the *logic* of the function,
    # but the *output content* will be from the first example's simulation.
    # For a dynamic simulation, the simulated_gemini_response itself would need to change
    # based on the input, which is beyond the scope of this specific hardcoded simulation.
    presentation_titles_2 = generate_presentation_outline(sample_feature_idea_2, sample_task_list_2)

    if presentation_titles_2:
        print("\nSuggested Presentation Slide Titles (Note: response is hardcoded for 1st example):")
        for i, title in enumerate(presentation_titles_2, 1):
            print(f"{i}. {title}")
    else:
        print("No slide titles were generated (or parsing failed).")
