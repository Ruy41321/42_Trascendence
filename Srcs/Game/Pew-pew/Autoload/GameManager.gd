extends Node
## GameManager - Manages game state and scene transitions
## Handles transitions between menus, lobbies, and gameplay

# Signals
signal scene_changed(scene_name: String)
signal game_state_changed(new_state: GameState)

# Game states
enum GameState {
	MAIN_MENU,
	LOBBY_BROWSER,
	IN_LOBBY,
	LOADING,
	IN_GAME,
	GAME_OVER
}

# Current state
var current_state: GameState = GameState.MAIN_MENU

# Scene paths
const SCENE_MAIN_MENU: String = "res://Scenes/UI/MainMenu.tscn"
const SCENE_LOBBY_BROWSER: String = "res://Scenes/UI/LobbyBrowser.tscn"
const SCENE_LOBBY: String = "res://Scenes/UI/Lobby.tscn"
const SCENE_GAME: String = "res://Scenes/Maps/Map.tscn"

# Game configuration
var game_config: Dictionary = {
	"match_duration": 120.0,  # 2 minutes
	"kills_to_win": 10,
	"max_players": 4
}

# Reference to current scene
var current_scene: Node = null


func _ready() -> void:
	LogManager.info("GameManager initialized")
	NetworkManager.game_started.connect(_on_game_started)


## Change to a new game state
func change_state(new_state: GameState) -> void:
	if current_state == new_state:
		return
	
	var old_state = current_state
	current_state = new_state
	
	LogManager.info("Game state changed: %s -> %s" % [
		GameState.keys()[old_state],
		GameState.keys()[new_state]
	])
	
	game_state_changed.emit(new_state)
	_handle_state_transition(new_state)


func _handle_state_transition(new_state: GameState) -> void:
	match new_state:
		GameState.MAIN_MENU:
			_load_scene(SCENE_MAIN_MENU)
		GameState.LOBBY_BROWSER:
			_load_scene(SCENE_LOBBY_BROWSER)
		GameState.IN_LOBBY:
			_load_scene(SCENE_LOBBY)
		GameState.IN_GAME:
			_start_game()
		GameState.GAME_OVER:
			pass  # Handled by in-game UI


func _load_scene(scene_path: String) -> void:
	LogManager.info("Loading scene: " + scene_path)
	
	var error = get_tree().change_scene_to_file(scene_path)
	if error != OK:
		LogManager.error("Failed to load scene: " + scene_path)
		return
	
	scene_changed.emit(scene_path)


func _start_game() -> void:
	LogManager.info("Starting game...")
	_load_scene(SCENE_GAME)


## Go to main menu
func go_to_main_menu() -> void:
	NetworkManager.leave_lobby()
	change_state(GameState.MAIN_MENU)


## Go to lobby browser
func go_to_lobby_browser() -> void:
	change_state(GameState.LOBBY_BROWSER)


## Go to lobby screen
func go_to_lobby() -> void:
	change_state(GameState.IN_LOBBY)


## Start the game from lobby
func start_game_from_lobby() -> void:
	if not NetworkManager.can_start_game():
		LogManager.warning("Cannot start game: conditions not met")
		return
	
	NetworkManager.start_game()


## Handle game over
func game_over(winner_data: Dictionary) -> void:
	current_state = GameState.GAME_OVER
	LogManager.info("Game over! Winner: " + winner_data.get("name", "Unknown"))


## Return to lobby after game
func return_to_lobby() -> void:
	change_state(GameState.IN_LOBBY)


## Quit the application
func quit_game() -> void:
	LogManager.info("Quitting game...")
	get_tree().quit()


## Handle game started signal from NetworkManager
func _on_game_started(game_data: Dictionary) -> void:
	LogManager.info("Game starting with %d players" % [
		game_data.get("players", []).size() + game_data.get("npcs", []).size()
	])
	change_state(GameState.IN_GAME)
