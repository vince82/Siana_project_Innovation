from django.contrib import admin
from .models import admin_user

class AdminUserAdmin(admin.ModelAdmin):
    # Champs à afficher dans la liste de l'interface admin
    list_display = ('nom_prenom', 'email')
    # Champs par lesquels vous pouvez rechercher
    search_fields = ('nom_prenom', 'email')
    # Tri des éléments par défaut
    ordering = ('nom_prenom',)

# Enregistrement du modèle avec la classe personnalisée
admin.site.register(admin_user, AdminUserAdmin)
