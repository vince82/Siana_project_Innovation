from django.shortcuts import render, redirect
from django.contrib import messages
from .models import admin_user

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            # Vérifiez si l'utilisateur existe
            user = admin_user.objects.get(email=email)

            # Vérifiez le mot de passe directement (pas de hachage)
            if password == user.password:
                # Enregistrer les informations de connexion dans la session
                request.session['user_id'] = user.id
                request.session['username'] = user.nom_prenom
                return redirect('admin_home')  # Redirigez après connexion réussie
            else:
                messages.error(request, "Mot de passe incorrect.")
        except admin_user.DoesNotExist:
            messages.error(request, "Utilisateur introuvable.")

    return render(request, 'admin_page/login.html')  


def logout_view(request):
    request.session.flush()  # Supprime toutes les données de session
    messages.success(request, "Vous êtes déconnecté.")
    return redirect('admin_login')  # Redirigez vers la page de connexion


def home_view(request):
    return render(request, 'admin_page/home.html')
