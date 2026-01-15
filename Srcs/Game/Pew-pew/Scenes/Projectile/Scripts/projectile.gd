extends CharacterBody2D
class_name Projectile

## Projectile controller for bullets fired by players
##
## Moves in a straight line in the direction it was fired and handles collisions
## with walls (tiles) and players.

# Movement parameters
@export var speed: float = 5000.0
@export var max_lifetime: float = 5.0

# State variables
var direction: Vector2 = Vector2.RIGHT
var shooter: Character = null
var lifetime: float = 0.0

# Node references
@onready var pew: AudioStreamPlayer = $Pew


func _ready() -> void:
	#LogManager.debug("Projectile spawned at %s with direction %s" % [global_position, direction], "Projectile")
	pew.play()


func _physics_process(delta: float) -> void:
	# Move projectile in its direction
	var velocity_vector: Vector2 = direction * speed * delta
	var collision: KinematicCollision2D = move_and_collide(velocity_vector)
	
	# Handle collision
	if collision:
		var collider = collision.get_collider()
		
		# Check if collided with a Player
		if collider is not Character or not shooter.is_alive:
			# Collided with a wall (TileMapLayer or other physics body)
			#LogManager.debug("Projectile hit wall/obstacle", "Projectile")
			_destroy_projectile()
			return

		var character: Character = collider as Character
		# Don't damage the player who fired this projectile or if shooter is dead
		if character.player_id == shooter.player_id:
			return
		
		# Store victim info before applying damage
		var was_alive = character.is_alive
		var victim_name = character.character_name
		
		# SET KILLER BEFORE take_hit() so die() can access it
		character.last_killer = shooter
		
		character.take_hit()
		LogManager.info(
			"Projectile hit Character %d, fired by Player %d" % [character.player_id, shooter.player_id],
			"Projectile"
		)
		
		# Check if the hit killed the player
		if was_alive and character.current_hp <= 0 and shooter:
			shooter.add_kill(victim_name)
		
		_destroy_projectile()
		return

	# Update lifetime and remove if too old
	lifetime += delta
	if lifetime > max_lifetime:
		_destroy_projectile()


## Initialize projectile with firing direction
func initialize(spawn_position: Vector2, fire_direction: Vector2, shooter_by: Character) -> void:
	global_position = spawn_position
	direction = fire_direction.normalized()
	shooter = shooter_by
	rotation = direction.angle()


## Destroy the projectile while letting the audio play completely
func _destroy_projectile() -> void:
	# Reparent the audio player to the map so it plays independently
	var audio_parent = get_parent()
	pew.reparent(audio_parent)
	
	# Destroy the projectile but audio keeps playing
	queue_free()
