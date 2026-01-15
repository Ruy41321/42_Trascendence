extends CanvasLayer

## Game HUD controller for displaying timer, scoreboard, and pause menu
##
## Shows remaining time, player kills, and handles pause/game end states

# Node references
@onready var timer_label: Label = $TopLeftPanel/TimerLabel
@onready var kill_list: VBoxContainer = $TopLeftPanel/KillList
@onready var pause_menu: Control = $PauseMenu
@onready var title_label: Label = $PauseMenu/CenterPanel/TitleLabel
@onready var winner_label: Label = $PauseMenu/CenterPanel/WinnerLabel
@onready var continue_button: Button = $PauseMenu/CenterPanel/ButtonsContainer/ContinueButton
@onready var rematch_button: Button = $PauseMenu/CenterPanel/ButtonsContainer/RematchButton
@onready var exit_button: Button = $PauseMenu/CenterPanel/ButtonsContainer/ExitButton
@onready var kill_feed_label: Label = %KillFeedLabel
@onready var respawn_countdown_label: Label = %RespawnCountdownLabel

# State
var is_paused: bool = false
var game_ended: bool = false
var player_labels: Dictionary = {}  # player_id: Label

# Kill feed and respawn countdown timers
var kill_feed_timer: float = 0.0
var respawn_countdown_timer: float = 0.0


func _ready() -> void:
	# Connect button signals
	continue_button.pressed.connect(_on_continue_pressed)
	rematch_button.pressed.connect(_on_rematch_pressed)
	exit_button.pressed.connect(_on_exit_pressed)
	
	# Hide pause menu initially
	pause_menu.visible = false
	
	LogManager.info("GameHUD initialized", "GameHUD")


func _process(_delta: float) -> void:
	# Handle pause input
	if Input.is_action_just_pressed("ui_cancel") and not game_ended:
		toggle_pause()
	
	# Update kill feed timer
	if kill_feed_timer > 0:
		kill_feed_timer -= _delta
		if kill_feed_timer <= 0:
			kill_feed_label.visible = false
	
	# Update respawn countdown timer
	if respawn_countdown_timer > 0:
		respawn_countdown_timer -= _delta
		if respawn_countdown_timer > 0:
			respawn_countdown_label.text = "Respawn: %.1f" % respawn_countdown_timer
		else:
			respawn_countdown_label.visible = false


## Updates the timer display
func update_timer(time_remaining: float) -> void:
	var minutes: int = int(time_remaining / 60)
	var seconds: int = int(time_remaining) % 60
	timer_label.text = "Time: %d:%02d" % [minutes, seconds]


## Updates the kill count for a specific player
func update_player_kills(player_id: int, player_name: String, kills: int) -> void:
	var label: Label
	if not player_labels.has(player_id):
		# Create new label for this player
		label = Label.new()
		label.add_theme_font_size_override("font_size", 20)
		kill_list.add_child(label)
		player_labels[player_id] = label
	else:
		label = player_labels[player_id]
	
	# Update label text
	label.text = "%s: %d kills" % [player_name, kills]


## Toggles pause state
func toggle_pause() -> void:
	is_paused = !is_paused
	pause_menu.visible = is_paused
	
	if is_paused:
		title_label.visible = true
		winner_label.visible = false
		continue_button.visible = true
		rematch_button.visible = false
		LogManager.info("Menu opened", "GameHUD")
	else:
		LogManager.info("Menu closed", "GameHUD")


## Shows game end screen with winner
func show_game_end(winner_name: String) -> void:
	game_ended = true
	is_paused = true
	pause_menu.visible = true
	
	# Update menu for game end state
	title_label.visible = false
	winner_label.visible = true
	winner_label.text = "%s Won!" % winner_name
	continue_button.visible = false
	rematch_button.visible = true
	
	LogManager.info("Game ended - Winner: %s" % winner_name, "GameHUD")


## Handle continue button press
func _on_continue_pressed() -> void:
	if not game_ended:
		toggle_pause()


## Handle rematch button press
func _on_rematch_pressed() -> void:
	LogManager.info("Rematch button pressed", "GameHUD")
	# TODO: Implement restart match logic (reload current scene)
	get_tree().reload_current_scene()


## Handle exit button press
func _on_exit_pressed() -> void:
	LogManager.info("Exit button pressed", "GameHUD")
	# TODO: Implement proper exit logic (return to lobby, disconnect, etc.)
	GameManager.go_to_main_menu()


## Check if the menu is currently open
func is_menu_open() -> bool:
	return pause_menu.visible


## Show kill notification when player eliminates someone
func show_kill_notification(victim_name: String) -> void:
	kill_feed_label.text = "Hai eliminato %s" % victim_name
	kill_feed_label.visible = true
	kill_feed_timer = 3.0  # Show for 3 seconds
	LogManager.info("Kill notification: eliminated %s" % victim_name, "GameHUD")


## Show death notification when player is eliminated
func show_death_notification(killer_name: String, respawn_time: float) -> void:
	kill_feed_label.text = "Sei stato eliminato da %s" % killer_name
	kill_feed_label.visible = true
	kill_feed_timer = respawn_time + 1 # Show kill feed for duration of respawn
	
	# Start respawn countdown - synchronized with actual respawn delay
	respawn_countdown_timer = respawn_time + 1
	respawn_countdown_label.visible = true
	respawn_countdown_label.text = "Respawn: %.1f" % respawn_time
	LogManager.info("Death notification: killed by %s, respawning in %.1f seconds" % [killer_name, respawn_time], "GameHUD")
