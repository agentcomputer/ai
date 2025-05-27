# comms_hub_ai.py

import re

# Although demo_models.ChatMessage is not directly imported or used,
# we are aware of its structure: ChatMessage(sender: str, text: str)
# This informs how a chat log might be structured or processed in a real scenario.

def extract_feature_ideas_from_chat(chat_log: str) -> list[str]:
    """
    Simulates using Gemini to extract product feature ideas from a chat log.
    """

    # 1. Prompt Engineering: Design a prompt for Gemini
    # This is the prompt we would theoretically send to Gemini.
    prompt_to_gemini = f"""
    Analyze the following chat log and identify 2-3 distinct product feature ideas discussed or implied.
    Return these ideas as a concise, numbered list of short text descriptions, each on a new line.
    For example:
    1. Feature One Description
    2. Feature Two Description

    Chat Log:
    ---
    {chat_log}
    ---
    Identified Feature Ideas:
    """

    # 2. Simulate Gemini's Response
    # This is a hardcoded example of what Gemini might return.
    # This simulation is based on a hypothetical analysis of the mock_chat_log defined in the example usage.
    # If the chat_log input to this function changes, this simulated response might not perfectly match,
    # but it serves to demonstrate the parsing logic.

    # Let's craft a simulated response that fits the prompt's requested format.
    # For the mock_chat_log below, features could be:
    # - A way to tag or categorize messages.
    # - Better notification system.
    # - Integration with a calendar.

    simulated_gemini_response = """
    Okay, I've analyzed the chat log. Here are the feature ideas:
    1. Message tagging or categorization system.
    2. Enhanced notification preferences for different chat types.
    3. Calendar integration for scheduling discussed events.
    """

    # In a real scenario, we would make an API call here:
    # actual_gemini_response = call_gemini_api(prompt_to_gemini)
    # For now, we use our simulated_gemini_response.

    # 3. Parsing: Extract feature ideas from the simulated response
    feature_ideas = []
    # We'll look for lines starting with a number and a period, typical for lists.
    # Example: "1. Some feature"
    # Using regex to find lines that start with a digit, a period, and a space.
    # We capture the text after "X. "
    matches = re.findall(r"^\s*\d+\.\s+(.+)", simulated_gemini_response, re.MULTILINE)
    if matches:
        for match in matches:
            feature_ideas.append(match.strip())
    
    # Fallback or alternative parsing if the above doesn't catch everything,
    # or if Gemini's format is slightly different.
    # For this simulation, the regex should be sufficient.
    # If no numbered list is found, we might try a more generic parsing,
    # or return an empty list, or a list with the raw response if it's short.

    # For this specific simulation, the regex `^\s*\d+\.\s+(.+)` is designed to capture
    # the text following patterns like "1. ", "2. ", etc.

    return feature_ideas

if __name__ == '__main__':
    mock_chat_log = """
    Alice: Hey team, I'm finding it hard to keep track of action items from our chats.
    Bob: I agree! Messages just get buried. Maybe we could flag messages as tasks?
    Charlie: Or a way to categorize conversations by project? That would help too.
    Alice: Good idea, Charlie! And what about important dates? I missed that meeting reminder yesterday.
    Bob: Oh, a calendar view or integration would be amazing.
    David: I also think the notifications are a bit much. Can we customize them?
    Alice: Yes, like only get notified for direct mentions in some chats.
    """

    print("Original Chat Log:")
    print(mock_chat_log)
    print("\n--- Simulating Gemini Analysis ---")

    # This part is for demonstration and would be used if we wanted to make the
    # simulated response dynamic based on the input `mock_chat_log`.
    # For this subtask, the `simulated_gemini_response` inside the function is static,
    # but it is *conceptually* derived from a log like `mock_chat_log`.
    # The prompt *is* dynamically generated with the `chat_log` input.
    
    # If we wanted a more dynamic simulation (optional for this task):
    # if "flag messages as tasks" in mock_chat_log or "categorize conversations" in mock_chat_log:
    #     # This is where we could alter `simulated_gemini_response` if it were accessible here
    #     # or if the function had more complex logic to generate it.
    #     # For now, the `simulated_gemini_response` in the function is fixed.
    #     pass


    extracted_features = extract_feature_ideas_from_chat(mock_chat_log)

    print("\nExtracted Feature Ideas (Simulated):")
    if extracted_features:
        for i, feature in enumerate(extracted_features, 1):
            print(f"{i}. {feature}")
    else:
        print("No specific feature ideas were extracted (or parsing failed).")

    # Test with a slightly different chat log to see if the prompt is used (it is)
    # and that the hardcoded response is still what's parsed.
    another_chat_log = """
    UserA: This app is great, but I wish I could just search for old messages.
    UserB: Totally! And maybe share them to my email?
    UserC: A dark mode would be easier on my eyes too.
    """
    print("\n--- Simulating Gemini Analysis for another chat log ---")
    extracted_features_2 = extract_feature_ideas_from_chat(another_chat_log)
    print("\nExtracted Feature Ideas (Simulated for another log):")
    if extracted_features_2:
        for i, feature in enumerate(extracted_features_2, 1):
            print(f"{i}. {feature}")
    else:
        print("No specific feature ideas were extracted.")
    # Note: The output will be the same because simulated_gemini_response is hardcoded.
    # The prompt sent to Gemini *would* be different, however.
    # print(f"\nPrompt that would be sent for 'another_chat_log':\n{prompt_to_gemini_for_another_log}")
    # (To show the dynamic prompt, `prompt_to_gemini` would need to be returned or printed by the function)
