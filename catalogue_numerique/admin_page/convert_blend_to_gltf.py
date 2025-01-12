import bpy
import sys

# Récupérer les arguments passés au script
input_file = sys.argv[-2]  # Fichier source .blend
output_file = sys.argv[-1]  # Fichier cible (ex: .gltf)

# Charger le fichier Blender
bpy.ops.wm.open_mainfile(filepath=input_file)

# Exporter en GLTF
bpy.ops.export_scene.gltf(filepath=output_file)
