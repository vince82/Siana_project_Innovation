from django.contrib import admin
from .models import (
    admin_user, Component, Component_details_technique,
    Component_description_technique_paragraphe, paragraphe_images,
    Component_model3D, Component_video, Component_document
)

@admin.register(admin_user)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('nom_prenom', 'email')  # Affiche le nom et l'email
    search_fields = ('nom_prenom', 'email')  # Permet la recherche

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')  # Affiche le nom du composant et son parent
    list_filter = ('parent',)  # Ajoute un filtre par parent
    search_fields = ('name',)  # Permet de rechercher par nom

@admin.register(Component_details_technique)
class ComponentDetailsTechniqueAdmin(admin.ModelAdmin):
    list_display = ('caractéristique', 'valeur', 'component')
    search_fields = ('caractéristique', 'valeur')

@admin.register(Component_description_technique_paragraphe)
class ComponentDescriptionTechniqueParagraphAdmin(admin.ModelAdmin):
    list_display = ('component', 'order')
    list_filter = ('component',)

@admin.register(paragraphe_images)
class ParagraphImageAdmin(admin.ModelAdmin):
    list_display = ('paragraphe', 'image')

@admin.register(Component_model3D)
class ComponentModel3DAdmin(admin.ModelAdmin):
    list_display = ['__str__']  # ou juste utilisez l'ID par défaut
@admin.register(Component_video)
class ComponentVideoAdmin(admin.ModelAdmin):
    list_display = ('component', 'video')

@admin.register(Component_document)
class ComponentDocumentAdmin(admin.ModelAdmin):
    list_display = ('component', 'document')
