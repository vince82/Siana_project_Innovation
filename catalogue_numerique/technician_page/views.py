from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from .models import technician_user
from admin_page.models import Component


# Connexion
def login_view(request):
    """Gérer la connexion d'un technicien."""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            # Vérifier si l'utilisateur existe
            user = technician_user.objects.get(email=email)

            # Vérifier le mot de passe directement
            if password == user.password:
                # Enregistrer les informations de connexion dans la session
                request.session['user_id'] = user.id
                request.session['username'] = user.nom_prenom
                return redirect('home')  # Rediriger après une connexion réussie
            else:
                messages.error(request, "Mot de passe incorrect.")
        except technician_user.DoesNotExist:
            messages.error(request, "Utilisateur introuvable.")

    return render(request, 'technician_page/login.html')


# Déconnexion
def logout_view(request):
    """Gérer la déconnexion."""
    request.session.flush()  # Supprimer toutes les données de session
    messages.success(request, "Vous êtes déconnecté.")
    return redirect('login')  # Rediriger vers la page de connexion


# Page d'accueil dynamique
def home_view(request):
    """Page d'accueil pour les techniciens."""
    # Récupérer tous les composants
    components = Component.objects.all()

    # Identifier le composant principal (sans parent)
    main_component = Component.objects.filter(parent__isnull=True).first()

    return render(request, 'technician_page/home.html', {
        'components': components,
        'main_component': main_component,
    })


from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from admin_page.models import Component

def get_component_3d(request, component_id):
    """Récupérer les informations du modèle 3D d'un composant."""
    component = get_object_or_404(Component, id=component_id)
    model3d = component.appareil_models3d.first()  # Récupérer le premier modèle 3D associé

    return JsonResponse({
        'model3d_url': model3d.model3D.url if model3d else None,  # URL du fichier modèle 3D
        'name': component.name,  # Nom du composant
    })


# Fiche technique d'un composant
def component_technical_sheet(request, component_id):
    """Afficher la fiche technique d'un composant."""
    component = get_object_or_404(Component, id=component_id)
    return render(request, 'technician_page/component_technical_sheet.html', {
        'component': component,
    })


from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from admin_page.models import Component

def search_components(request):
    """Recherche dynamique des composants."""
    query = request.GET.get('q', '')  # Récupérer la requête utilisateur
    results = []

    if query:  # Si une requête est fournie
        components = Component.objects.filter(name__icontains=query)[:10]  # Limite à 10 résultats
        results = [{'id': comp.id, 'name': comp.name} for comp in components]

    return JsonResponse(results, safe=False)
