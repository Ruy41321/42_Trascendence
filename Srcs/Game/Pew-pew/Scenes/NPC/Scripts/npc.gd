extends Character

class_name NPC

## NPC controller with AI behavior
##
## Moves toward nearest player, aims, and shoots automatically.
## Inherits common behavior from Character.

# AI parameters
@export var target_acquisition_range: float = 3000.0  # Distance at which NPC can detect and acquire targets
@export var fire_decision_delay: float = 0.5  # Time aiming before firing

# Wandering parameters
@export var wander_direction_change_interval: float = 5.0  # Seconds between direction changes

# AI state
var target_player: Character = null
var time_aiming_at_target: float = 0.0

# Wandering state
var wander_direction: Vector2 = Vector2.ZERO
var wander_timer: float = 0.0

# Node references
@onready var skin: Node2D = $Skin
@onready var detection_raycast: RayCast2D = $DetectionRayCast


func setup_character() -> void:
	LogManager.info("NPC initialized with %d HP" % current_hp, "NPC")
	set_skin()
	# Start with a random wander direction
	_pick_random_wander_direction()
	respawn()


func _physics_process(delta: float) -> void:
	if not is_alive:
		return
	
	# AI behavior
	update_target()
	handle_movement(delta)
	handle_aiming()
	handle_shooting(delta)

	# Move the NPC
	move_and_slide()
	
	# Check for wall collisions and change direction
	if get_slide_collision_count() > 0:
		for i in get_slide_collision_count():
			var collision = get_slide_collision(i)
			if collision.get_collider() is not Character:
				# Hit a wall, pick new direction
				_pick_random_wander_direction()
				wander_timer = 0.0
				break


## Updates the current target (nearest visible player)
func update_target() -> void:
	var level_manager: LevelManager = get_parent() as LevelManager
	if not level_manager:
		return
	
	var nearest_player: Character = null
	var nearest_distance: float = INF
	
	# Find nearest player
	for character in level_manager.players:
		if character == self or not character.is_alive:
			continue

		var distance: float = global_position.distance_to(character.global_position)
		if distance < nearest_distance and distance < target_acquisition_range:
			# Check line of sight
			if is_target_visible(character):
				nearest_distance = distance
				nearest_player = character
	
	target_player = nearest_player


## Checks if target is visible (no obstacles blocking)
func is_target_visible(target: Character) -> bool:
	if not target:
		return false
	
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsRayQueryParameters2D.create(
		global_position,
		target.global_position
	)
	query.collision_mask = 1  # Only check walls
	query.exclude = [self]
	
	var result = space_state.intersect_ray(query)
	return result.is_empty() or result.collider is Character  # True if no walls blocking


## Handles NPC movement toward target
func handle_movement(delta: float) -> void:
	if not target_player:
		# No target, wander randomly
		handle_wandering(delta)
		return

	# Move toward target at full speed
	var direction: Vector2 = (target_player.global_position - global_position).normalized()
	velocity = direction * speed


## Handles random wandering when no target is visible
func handle_wandering(delta: float) -> void:
	wander_timer += delta
	
	# Change direction periodically
	if wander_timer >= wander_direction_change_interval:
		_pick_random_wander_direction()
		wander_timer = 0.0
	
	# Move at full speed
	velocity = wander_direction * speed
	
	# Rotate toward wander direction
	if wander_direction != Vector2.ZERO:
		rotation = wander_direction.angle() - PI / 2


## Pick a random direction for wandering
func _pick_random_wander_direction() -> void:
	var random_angle = randf() * TAU  # Random angle 0 to 2*PI
	wander_direction = Vector2.from_angle(random_angle)


## Handles NPC aiming at target
func handle_aiming() -> void:
	if not target_player:
		return
	
	# Rotate toward target
	var target_direction: Vector2 = target_player.global_position - global_position
	rotation = target_direction.angle() - PI / 2  # Point toward target with offset


## Handles NPC shooting decision
func handle_shooting(delta: float) -> void:
	if not target_player:
		time_aiming_at_target = 0.0
		return
	
	# Check if aiming at target
	var target_direction: Vector2 = (target_player.global_position - global_position).normalized()
	var facing_direction: Vector2 = Vector2.from_angle(rotation + PI / 2)
	var dot_product: float = facing_direction.dot(target_direction)
	
	# If facing target (within threshold)
	if dot_product > 0.95:  # ~18 degree cone
		time_aiming_at_target += delta
		
		# Fire if aimed long enough
		if time_aiming_at_target >= fire_decision_delay:
			var current_time = Time.get_ticks_msec() / 1000.0
			if current_time - last_fire_time >= fire_rate:
				shoot_npc()
				last_fire_time = current_time
	else:
		time_aiming_at_target = 0.0


## Executes shooting action (NPC-specific)
func shoot_npc() -> void:
	# Calculate firing direction (where the NPC is looking)
	var fire_direction: Vector2 = Vector2.from_angle(rotation + PI / 2)
	
	# Call base class shoot method
	shoot(fire_direction)


func set_skin() -> void:
	LogManager.info("Setting skin for NPC ID: %d" % player_id, "NPC")
	# Create a unique copy of the shader material for this NPC
	if skin and skin.has_node("Back"):
		shader_material = (skin.get_node("Back").material as ShaderMaterial).duplicate()
		
		for part in skin.get_children():
			if part is Sprite2D:
				part.set_material(shader_material)
