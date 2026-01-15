extends Control
## Main Menu - Entry point for the game
## Allows players to enter their name and navigate to lobby system

@onready var name_input: LineEdit = %NameInput
@onready var play_button: Button = %PlayButton
@onready var quick_play_button: Button = %QuickPlayButton
@onready var quit_button: Button = %QuitButton

# Default player name for testing
const DEFAULT_NAME: String = "Player"


func _ready() -> void:
	LogManager.info("MainMenu loaded")
	_setup_ui()
	_connect_signals()
	
	# Focus on name input
	name_input.grab_focus()


func _setup_ui() -> void:
	# Set default name if empty
	if name_input.text.is_empty():
		name_input.text = DEFAULT_NAME + str(randi() % 1000)
	
	# Update button states
	_update_button_states()


func _connect_signals() -> void:
	play_button.pressed.connect(_on_play_pressed)
	quick_play_button.pressed.connect(_on_quick_play_pressed)
	quit_button.pressed.connect(_on_quit_pressed)
	name_input.text_changed.connect(_on_name_changed)
	name_input.text_submitted.connect(_on_name_submitted)


func _on_name_changed(_new_text: String) -> void:
	_update_button_states()


func _on_name_submitted(_text: String) -> void:
	# Pressing Enter in name field triggers Play
	if _is_name_valid():
		_on_play_pressed()


func _update_button_states() -> void:
	var name_valid = _is_name_valid()
	play_button.disabled = not name_valid
	quick_play_button.disabled = not name_valid


func _is_name_valid() -> bool:
	var player_name_text = name_input.text.strip_edges()
	return player_name_text.length() >= 1 and player_name_text.length() <= 16


func _save_player_name() -> void:
	var player_name_text = name_input.text.strip_edges()
	NetworkManager.set_player_name(player_name_text)
	LogManager.info("Player name saved: " + player_name_text)


func _on_play_pressed() -> void:
	if not _is_name_valid():
		return
	
	_save_player_name()
	LogManager.info("Navigating to lobby browser")
	GameManager.go_to_lobby_browser()


func _on_quick_play_pressed() -> void:
	if not _is_name_valid():
		return
	
	_save_player_name()
	LogManager.info("Starting quick play game")
	
	# Create a lobby and add some bots
	NetworkManager.create_lobby()
	
	# Wait for lobby creation, then add bots and start
	await get_tree().create_timer(0.1).timeout
	
	# Add 2 bots for quick play
	NetworkManager.add_npc()
	await get_tree().create_timer(0.05).timeout
	NetworkManager.add_npc()
	await get_tree().create_timer(0.05).timeout
	NetworkManager.add_npc()
	await get_tree().create_timer(0.05).timeout
	
	# Start the game
	NetworkManager.start_game()


func _on_quit_pressed() -> void:
	LogManager.info("Quitting game from main menu")
	GameManager.quit_game()


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		_on_quit_pressed()
