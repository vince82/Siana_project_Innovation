import os
import subprocess

def convert_blend_to_gltf(input_path, output_path):
    """
    Convertit un fichier Blender (.blend) en fichier GLTF (.gltf ou .glb)
    en utilisant Blender en mode script.

    :param input_path: Chemin vers le fichier source .blend
    :param output_path: Chemin vers le fichier cible .gltf ou .glb
    """
    blender_executable = "C:\\blender-4.3.2-windows-x64\\blender-4.3.2-windows-x64\\blender.exe"  # Chemin de Blender
    script_path = os.path.join(os.getcwd(), "convert_blend_to_gltf.py")  # Script de conversion

    subprocess.run([
        blender_executable,
        "--background",
        "--python", script_path,
        input_path,
        output_path
    ])
