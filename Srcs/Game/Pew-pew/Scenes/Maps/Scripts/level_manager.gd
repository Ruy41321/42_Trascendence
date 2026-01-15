extends Node2D

class_name LevelManager

## Level Manager handles player spawning, game timer, and win conditions
##
## Manages the match state, tracks kills, and determines winners

# Game settings (loaded from GameManager.game_config)
var match_duration: float = 120.0  # 2 minutes
var kills_to_win: int = 10
var players_amount: int = 2

# Game state
var game_time_remaining: float = 0.0
var game_started: bool = false
var game_ended: bool = false

# References
var game_hud: CanvasLayer = null
var players: Array[Character] = []


func _ready() -> void:
	LogManager.info("Level Manager initialized", "LevelManager")
	
	# Load game settings from GameManager
	_load_game_config()
	
	# Load and add GameHUD
	var hud_scene: PackedScene = load("res://Scenes/UI/GameHUD.tscn")
	game_hud = hud_scene.instantiate()
	add_child(game_hud)
	
	spawn_players()
	start_match()


func _process(delta: float) -> void:
	if game_started and not game_ended:
		# Update timer
		game_time_remaining -= delta
		
		if game_time_remaining <= 0:
			game_time_remaining = 0
			end_match_by_time()
		
		# Update HUD timer
		if game_hud:
			game_hud.update_timer(game_time_remaining)


## Starts the match
func start_match() -> void:
	game_time_remaining = match_duration
	game_started = true
	LogManager.info("Match started - Duration: %.0f seconds, Kill limit: %d" % [match_duration, kills_to_win], "LevelManager")


## Load game configuration from GameManager
func _load_game_config() -> void:
	# Load from GameManager if available
	if GameManager:
		match_duration = GameManager.game_config.get("match_duration", 120.0)
		kills_to_win = GameManager.game_config.get("kills_to_win", 10)
	
	# Load player count from NetworkManager lobby data
	if NetworkManager and NetworkManager.current_lobby:
		var lobby = NetworkManager.current_lobby
		var player_count = lobby.get("players", []).size()
		var npc_count = lobby.get("npcs", []).size()
		players_amount = player_count + npc_count
		LogManager.info("Loaded game config - Duration: %.0f, Kill limit: %d, Players: %d" % [match_duration, kills_to_win, players_amount], "LevelManager")
	else:
		LogManager.warning("No lobby data available, using default player amount", "LevelManager")


## Spawns all players and NPCs based on lobby data
func spawn_players() -> void:
	var respawn_points: Array[RespawnPoint] = []
	for child in get_children():
		if child is RespawnPoint:
			respawn_points.append(child)
	
	if players_amount > respawn_points.size():
		LogManager.error("Not enough respawn points for the number of players!", "LevelManager")
		return
	
	var spawn_index: int = 0
	
	# Get lobby data from NetworkManager
	if NetworkManager and NetworkManager.current_lobby:
		var lobby = NetworkManager.current_lobby
		
		# Spawn human players
		var lobby_players = lobby.get("players", [])
		for player_data in lobby_players:
			if spawn_index >= respawn_points.size():
				break
			
			var player_scene: PackedScene = ResourceLoader.load("res://Scenes/Player/Player.tscn")
			var player_instance: Character = player_scene.instantiate() as Character
			player_instance.player_id = spawn_index
			player_instance.character_name = player_data.get("name", "Player %d" % spawn_index)
			player_instance.respawn_location = respawn_points[spawn_index].global_position
			add_child(player_instance)
			players.append(player_instance)
			
			# Connect to player's kill signal
			player_instance.tree_exited.connect(_on_player_removed.bind(player_instance))
			
			# Initialize HUD for this player
			if game_hud:
				game_hud.update_player_kills(spawn_index, player_instance.character_name, 0)
			
			LogManager.info("Spawned Player: %s at index %d" % [player_instance.character_name, spawn_index], "LevelManager")
			spawn_index += 1
		
		# Spawn NPCs
		var lobby_npcs = lobby.get("npcs", [])
		for npc_data in lobby_npcs:
			if spawn_index >= respawn_points.size():
				break
			
			var npc_scene: PackedScene = ResourceLoader.load("res://Scenes/NPC/NPC.tscn")
			var npc_instance: Character = npc_scene.instantiate() as Character
			npc_instance.player_id = spawn_index
			npc_instance.character_name = npc_data.get("name", "Bot_%d" % spawn_index)
			npc_instance.respawn_location = respawn_points[spawn_index].global_position
			add_child(npc_instance)
			players.append(npc_instance)
			
			# Connect to NPC's tree exited signal
			npc_instance.tree_exited.connect(_on_player_removed.bind(npc_instance))
			
			# Initialize HUD for this NPC
			if game_hud:
				game_hud.update_player_kills(spawn_index, npc_instance.character_name, 0)
			
			LogManager.info("Spawned NPC: %s at index %d" % [npc_instance.character_name, spawn_index], "LevelManager")
			spawn_index += 1
	else:
		# Fallback: spawn default players if no lobby data
		LogManager.warning("No lobby data, spawning default players", "LevelManager")
		for i in players_amount:
			var player_scene: PackedScene = ResourceLoader.load("res://Scenes/Player/Player.tscn")
			var player_instance: Character = player_scene.instantiate() as Character
			player_instance.player_id = i
			player_instance.character_name = "Player %d" % i
			player_instance.respawn_location = respawn_points[i].global_position
			add_child(player_instance)
			players.append(player_instance)
			
			# Connect to player's kill signal
			player_instance.tree_exited.connect(_on_player_removed.bind(player_instance))
			
			# Initialize HUD for this player
			if game_hud:
				game_hud.update_player_kills(i, player_instance.character_name, 0)


## Called when a player gets a kill
func on_player_kill(player: Character) -> void:
	if game_ended:
		return
	
	# Update HUD
	if game_hud:
		game_hud.update_player_kills(player.player_id, player.character_name, player.kill_count)
	
	# Check win condition
	if player.kill_count >= kills_to_win:
		end_match_by_kills(player)


## Ends match when a player reaches kill limit
func end_match_by_kills(winner: Character) -> void:
	if game_ended:
		return
	
	game_ended = true
	game_started = false
	
	LogManager.info("Match ended - Player %d won by kills (%d kills)" % [winner.player_id, winner.kill_count], "LevelManager")
	
	if game_hud:
		game_hud.show_game_end(winner.character_name)


## Ends match when time runs out
func end_match_by_time() -> void:
	if game_ended:
		return
	
	game_ended = true
	game_started = false
	
	# Find player with most kills
	var winner: Character = null
	var max_kills: int = -1
	
	for player in players:
		if player and player.kill_count > max_kills:
			max_kills = player.kill_count
			winner = player
	
	if winner:
		LogManager.info("Match ended - Time's up! Player %d won with %d kills" % [winner.player_id, winner.kill_count], "LevelManager")
		if game_hud:
			game_hud.show_game_end(winner.character_name)
	else:
		LogManager.info("Match ended - Time's up! No winner (tie)", "LevelManager")
		if game_hud:
			game_hud.show_game_end("Draw")


## Handle player removal
func _on_player_removed(player: Character) -> void:
	players.erase(player)


func get_players_amount() -> int:
	return players_amount


## Get reference to game HUD
func get_game_hud() -> CanvasLayer:
	return game_hud
