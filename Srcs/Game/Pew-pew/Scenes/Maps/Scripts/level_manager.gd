extends Node2D

class_name LevelManager


var players_amount: int = 3

func _ready() -> void:
	LogManager.info("Level Manager initialized", "LevelManager")
	spawnPlayers()

func spawnPlayers() -> void:
	var respawn_points: Array[RespawnPoint] = []
	for child in get_children():
		if child is RespawnPoint:
			respawn_points.append(child)
	if players_amount > respawn_points.size():
		LogManager.error("Not enough respawn points for the number of players!", "LevelManager")
		return
	for i in players_amount:
		var player_scene: PackedScene = ResourceLoader.load("res://Scenes/Player/Player.tscn")
		var player_instance: Player = player_scene.instantiate() as Player
		player_instance.player_id = i
		player_instance.respawn_location = respawn_points[i].global_position
		add_child(player_instance)

func get_players_amount() -> int:
	return players_amount
