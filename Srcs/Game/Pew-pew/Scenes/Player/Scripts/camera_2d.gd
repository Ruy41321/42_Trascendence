extends Camera2D

## Camera2D controller for the player
##
## Manages camera movement and boundary constraints based on the tilemap.
## Only enabled for the local player.

@export var boundary_offset: float = 128.0  # Extra padding from map edges


func _ready() -> void:
	if ClientManager.my_peer_id != get_parent().player_id:
		enabled = false
		set_process(false)
		set_physics_process(false)
		return
	
	LogManager.info("Camera2D initialized", "Camera2D")
	_set_camera_limits()


## Set camera limits based on the tilemap boundaries
func _set_camera_limits() -> void:
	# Get the map root node
	var map_node = get_tree().root.get_node("Map")
	if not map_node:
		LogManager.warning("Could not find Map node", "Camera2D")
		return
	
	# Get the TileMapLayer
	var tilemap = map_node.get_node("TileMapLayer") as TileMapLayer
	if not tilemap:
		LogManager.warning("Could not find TileMapLayer in Map", "Camera2D")
		return
	
	# Get the used cells to calculate bounds
	var used_cells = tilemap.get_used_cells()
	if used_cells.is_empty():
		LogManager.warning("TileMapLayer has no used cells", "Camera2D")
		return
	
	# Calculate the bounds of the tilemap
	var min_cell = Vector2i.ZERO
	var max_cell = Vector2i.ZERO
	
	for cell in used_cells:
		min_cell.x = min(min_cell.x, cell.x)
		min_cell.y = min(min_cell.y, cell.y)
		max_cell.x = max(max_cell.x, cell.x)
		max_cell.y = max(max_cell.y, cell.y)
	
	# Convert cell coordinates to world coordinates
	# Tilemap cell size is 256x256
	var cell_size: int = 256
	
	var left_bound: float = (min_cell.x * cell_size) + boundary_offset
	var right_bound: float = ((max_cell.x + 1) * cell_size) - boundary_offset
	var top_bound: float = (min_cell.y * cell_size) + boundary_offset
	var bottom_bound: float = ((max_cell.y + 1) * cell_size) - boundary_offset
	
	# Set camera limits
	limit_left = int(left_bound)
	limit_right = int(right_bound)
	limit_top = int(top_bound)
	limit_bottom = int(bottom_bound)
	
	LogManager.info(
		"Camera limits set - Left: %d, Right: %d, Top: %d, Bottom: %d" 
		% [limit_left, limit_right, limit_top, limit_bottom],
		"Camera2D"
	)
