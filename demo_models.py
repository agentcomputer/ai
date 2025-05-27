# demo_models.py

# In-memory storage
_chat_messages: list[dict] = []
_project_tasks: list[dict] = []
_presentation_slides: list[dict] = []

# --- ChatMessage Model and Functions ---
class ChatMessage:
    def __init__(self, sender: str, text: str):
        self.sender = sender
        self.text = text

    def __repr__(self):
        return f"ChatMessage(sender='{self.sender}', text='{self.text}')"

def add_chat_message(sender: str, text: str) -> ChatMessage:
    """Adds a new chat message to the history."""
    message = ChatMessage(sender, text)
    _chat_messages.append(vars(message)) # Store as dict for simplicity in demo
    return message

def get_chat_history() -> list[ChatMessage]:
    """Retrieves the entire chat history."""
    return [ChatMessage(**msg) for msg in _chat_messages]

# --- ProjectTask Model and Functions ---
class ProjectTask:
    def __init__(self, task_name: str, sub_tasks: list[str] = None, status: str = "To Do"):
        self.task_name = task_name
        self.sub_tasks = sub_tasks if sub_tasks is not None else []
        self.status = status

    def __repr__(self):
        return f"ProjectTask(task_name='{self.task_name}', sub_tasks={self.sub_tasks}, status='{self.status}')"

def create_project_task(task_name: str, sub_tasks: list[str] = None) -> ProjectTask:
    """Creates a new project task."""
    task = ProjectTask(task_name, sub_tasks)
    _project_tasks.append(vars(task)) # Store as dict
    return task

def get_project_tasks() -> list[ProjectTask]:
    """Retrieves all project tasks."""
    return [ProjectTask(**task) for task in _project_tasks]

# --- PresentationSlide Model and Functions ---
class PresentationSlide:
    def __init__(self, slide_title: str, bullet_points: list[str] = None):
        self.slide_title = slide_title
        self.bullet_points = bullet_points if bullet_points is not None else []

    def __repr__(self):
        return f"PresentationSlide(slide_title='{self.slide_title}', bullet_points={self.bullet_points})"

def add_presentation_slide(title: str, bullet_points: list[str] = None) -> PresentationSlide:
    """Adds a new presentation slide."""
    slide = PresentationSlide(title, bullet_points)
    _presentation_slides.append(vars(slide)) # Store as dict
    return slide

def get_presentation_slides() -> list[PresentationSlide]:
    """Retrieves all presentation slides."""
    return [PresentationSlide(**slide) for slide in _presentation_slides]

if __name__ == '__main__':
    # Example Usage (optional, for testing)
    msg1 = add_chat_message("Alice", "Hello Bob!")
    msg2 = add_chat_message("Bob", "Hi Alice!")
    print(get_chat_history())

    task1 = create_project_task("Develop Feature X", ["Subtask 1", "Subtask 2"])
    task2 = create_project_task("Write Documentation")
    print(get_project_tasks())

    slide1 = add_presentation_slide("Introduction", ["Point A", "Point B"])
    slide2 = add_presentation_slide("Conclusion")
    print(get_presentation_slides())

    # Test retrieving empty lists
    _chat_messages.clear()
    _project_tasks.clear()
    _presentation_slides.clear()
    print(get_chat_history())
    print(get_project_tasks())
    print(get_presentation_slides())

    # Test adding after clearing
    add_chat_message("Test", "Test message after clear")
    print(get_chat_history())
    create_project_task("Test Task After Clear")
    print(get_project_tasks())
    add_presentation_slide("Test Slide After Clear")
    print(get_presentation_slides())
