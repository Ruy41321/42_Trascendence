extends Control
## Lobby - In-lobby screen showing players and game controls
## Owner can add NPCs and start the game, others wait

@onready var lobby_title: Label = %LobbyTitle
@onready var player_count_label: Label = %PlayerCountLabel
@onready var player_list: VBoxContainer = %PlayerList
@onready var owner_only_label: Label = %OwnerOnlyLabel
@onready var add_npc_button: Button = %AddNPCButton
@onready var remove_npc_button: Button = %RemoveNPCButton
@onready var waiting_label: Label = %WaitingLabel
@onready var start_game_button: Button = %StartGameButton
@onready var leave_lobby_button: Button = %LeaveLobbyButton


func _ready() -> void:
	LogManager.info("Lobby screen loaded")
	_connect_signals()
	_update_lobby_display()


func _connect_signals() -> void:
	add_npc_button.pressed.connect(_on_add_npc_pressed)
	remove_npc_button.pressed.connect(_on_remove_npc_pressed)
	start_game_button.pressed.connect(_on_start_game_pressed)
	leave_lobby_button.pressed.connect(_on_leave_lobby_pressed)
	NetworkManager.lobby_updated.connect(_on_lobby_updated)
	NetworkManager.player_joined_lobby.connect(_on_player_joined)
	NetworkManager.player_left_lobby.connect(_on_player_left)


func _update_lobby_display() -> void:
	var lobby = NetworkManager.current_lobby
	
	if lobby.is_empty():
		LogManager.warning("No lobby data available")
		return
	
	# Update title
	lobby_title.text = "Lobby: " + lobby.get("name", "Unknown")
	
	# Update player count
	var total = lobby.get("players", []).size() + lobby.get("npcs", []).size()
	var max_p = lobby.get("max_players", 4)
	player_count_label.text = "%d/%d" % [total, max_p]
	
	# Update player list
	_update_player_list(lobby)
	
	# Update UI based on owner status
	_update_owner_controls()


func _update_player_list(lobby: Dictionary) -> void:
	# Clear existing player entries
	for child in player_list.get_children():
		child.queue_free()
	
	# Add players
	var players = lobby.get("players", [])
	for i in range(players.size()):
		var player = players[i]
		var entry = _create_player_entry(player, i + 1)
		player_list.add_child(entry)
	
	# Add NPCs
	var npcs = lobby.get("npcs", [])
	var npc_start = players.size() + 1
	for i in range(npcs.size()):
		var npc = npcs[i]
		var entry = _create_npc_entry(npc, npc_start + i)
		player_list.add_child(entry)


func _create_player_entry(player: Dictionary, index: int) -> HBoxContainer:
	var entry = HBoxContainer.new()
	entry.add_theme_constant_override("separation", 10)
	
	# Index number
	var index_label = Label.new()
	index_label.text = str(index) + "."
	index_label.custom_minimum_size = Vector2(30, 0)
	index_label.add_theme_font_size_override("font_size", 18)
	
	# Player name
	var name_label = Label.new()
	var display_name = player.get("name", "Unknown")
	if player.get("is_owner", false):
		display_name += " (Owner)"
	name_label.text = display_name
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_label.add_theme_font_size_override("font_size", 18)
	
	# Highlight if this is the local player
	if player.get("id", "") == NetworkManager.player_id:
		name_label.add_theme_color_override("font_color", Color(0.3, 0.8, 0.3, 1))
	
	entry.add_child(index_label)
	entry.add_child(name_label)
	
	return entry


func _create_npc_entry(npc: Dictionary, index: int) -> HBoxContainer:
	var entry = HBoxContainer.new()
	entry.add_theme_constant_override("separation", 10)
	
	# Index number
	var index_label = Label.new()
	index_label.text = str(index) + "."
	index_label.custom_minimum_size = Vector2(30, 0)
	index_label.add_theme_font_size_override("font_size", 18)
	
	# NPC name with bot indicator
	var name_label = Label.new()
	name_label.text = npc.get("name", "Bot") + " [BOT]"
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_label.add_theme_font_size_override("font_size", 18)
	name_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7, 1))
	
	entry.add_child(index_label)
	entry.add_child(name_label)
	
	return entry


func _update_owner_controls() -> void:
	var is_owner = NetworkManager.is_lobby_owner
	var lobby = NetworkManager.current_lobby
	var total = lobby.get("players", []).size() + lobby.get("npcs", []).size()
	var max_p = lobby.get("max_players", 4)
	var has_npcs = lobby.get("npcs", []).size() > 0
	
	# Show/hide owner-only elements
	owner_only_label.visible = is_owner
	add_npc_button.visible = is_owner
	remove_npc_button.visible = is_owner and has_npcs
	start_game_button.visible = is_owner
	waiting_label.visible = not is_owner
	
	# Update button states
	add_npc_button.disabled = total >= max_p
	start_game_button.disabled = total < 2
	
	# Update button text
	if total < 2:
		start_game_button.text = "Need 2+ Players"
	else:
		start_game_button.text = "START GAME"


func _on_add_npc_pressed() -> void:
	LogManager.info("Adding NPC to lobby")
	NetworkManager.add_npc()


func _on_remove_npc_pressed() -> void:
	var npcs = NetworkManager.current_lobby.get("npcs", [])
	if npcs.size() > 0:
		var last_npc = npcs[npcs.size() - 1]
		LogManager.info("Removing NPC: " + last_npc.get("name", ""))
		NetworkManager.remove_npc(last_npc.get("id", ""))


func _on_start_game_pressed() -> void:
	if not NetworkManager.can_start_game():
		LogManager.warning("Cannot start game yet")
		return
	
	LogManager.info("Starting game from lobby")
	NetworkManager.start_game()


func _on_leave_lobby_pressed() -> void:
	LogManager.info("Leaving lobby")
	NetworkManager.leave_lobby()
	GameManager.go_to_lobby_browser()


func _on_lobby_updated(_lobby_data: Dictionary) -> void:
	_update_lobby_display()


func _on_player_joined(player_data: Dictionary) -> void:
	LogManager.info("Player joined: " + player_data.get("name", "Unknown"))
	_update_lobby_display()


func _on_player_left(player_id: String) -> void:
	LogManager.info("Player left: " + player_id)
	_update_lobby_display()


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		_on_leave_lobby_pressed()
