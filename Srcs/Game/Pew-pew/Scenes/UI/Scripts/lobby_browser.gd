extends Control
## Lobby Browser - Shows list of available lobbies to join
## Allows creating new lobbies or joining existing ones

@onready var refresh_button: Button = %RefreshButton
@onready var lobby_list: VBoxContainer = %LobbyList
@onready var no_lobbies_label: Label = %NoLobbiesLabel
@onready var back_button: Button = %BackButton
@onready var create_lobby_button: Button = %CreateLobbyButton

# Lobby item scene (created dynamically)
const LOBBY_ITEM_HEIGHT: int = 50


func _ready() -> void:
	LogManager.info("LobbyBrowser loaded")
	_connect_signals()
	_refresh_lobby_list()


func _connect_signals() -> void:
	refresh_button.pressed.connect(_on_refresh_pressed)
	back_button.pressed.connect(_on_back_pressed)
	create_lobby_button.pressed.connect(_on_create_lobby_pressed)
	NetworkManager.lobby_list_received.connect(_on_lobby_list_received)
	NetworkManager.lobby_joined.connect(_on_lobby_joined)


func _on_refresh_pressed() -> void:
	LogManager.info("Refreshing lobby list")
	_refresh_lobby_list()


func _refresh_lobby_list() -> void:
	NetworkManager.request_lobby_list()


func _on_lobby_list_received(lobbies: Array) -> void:
	_clear_lobby_list()
	
	if lobbies.is_empty():
		no_lobbies_label.visible = true
		return
	
	no_lobbies_label.visible = false
	
	for lobby in lobbies:
		_create_lobby_item(lobby)


func _clear_lobby_list() -> void:
	# Remove all lobby items except the "no lobbies" label
	for child in lobby_list.get_children():
		if child != no_lobbies_label:
			child.queue_free()


func _create_lobby_item(lobby: Dictionary) -> void:
	var item = HBoxContainer.new()
	item.custom_minimum_size = Vector2(0, LOBBY_ITEM_HEIGHT)
	
	# Background panel
	var panel = PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var inner_hbox = HBoxContainer.new()
	inner_hbox.add_theme_constant_override("separation", 10)
	
	# Lobby name
	var name_label = Label.new()
	name_label.text = lobby.get("name", "Unknown Lobby")
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_label.size_flags_stretch_ratio = 3.0
	name_label.add_theme_font_size_override("font_size", 18)
	
	# Player count
	var player_count = lobby.get("players", []).size() + lobby.get("npcs", []).size()
	var max_players = lobby.get("max_players", 4)
	var players_label = Label.new()
	players_label.text = "%d/%d" % [player_count, max_players]
	players_label.custom_minimum_size = Vector2(100, 0)
	players_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	players_label.add_theme_font_size_override("font_size", 18)
	
	# Join button
	var join_button = Button.new()
	join_button.custom_minimum_size = Vector2(100, 40)
	join_button.add_theme_font_size_override("font_size", 16)
	
	if player_count >= max_players:
		join_button.text = "FULL"
		join_button.disabled = true
	else:
		join_button.text = "JOIN"
		join_button.pressed.connect(_on_join_lobby.bind(lobby.get("id", "")))
	
	# Add elements
	inner_hbox.add_child(name_label)
	inner_hbox.add_child(players_label)
	inner_hbox.add_child(join_button)
	panel.add_child(inner_hbox)
	item.add_child(panel)
	
	lobby_list.add_child(item)


func _on_join_lobby(lobby_id: String) -> void:
	LogManager.info("Joining lobby: " + lobby_id)
	NetworkManager.join_lobby(lobby_id)


func _on_lobby_joined(_lobby_data: Dictionary) -> void:
	LogManager.info("Successfully joined lobby")
	GameManager.go_to_lobby()


func _on_create_lobby_pressed() -> void:
	LogManager.info("Creating new lobby")
	NetworkManager.create_lobby()


func _on_back_pressed() -> void:
	LogManager.info("Returning to main menu")
	GameManager.go_to_main_menu()


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		_on_back_pressed()
