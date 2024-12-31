from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from .models import Component
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from django.contrib import messages
from .models import admin_user,Component,Component_details_technique,Component_description_technique_paragraphe,paragraphe_images,Component_model3D,Component_video,Component_document

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = admin_user.objects.get(email=email)
            if password == user.password:
                request.session['user_id'] = user.id
                request.session['username'] = user.nom_prenom
                return redirect('admin_home')
            else:
                messages.error(request, "Mot de passe incorrect.")
        except admin_user.DoesNotExist:
            messages.error(request, "Utilisateur introuvable.")

    return render(request, 'admin_page/login.html')




def logout_view(request):
    request.session.flush()  # Supprime toutes les données de session
    messages.success(request, "Vous êtes déconnecté.")
    return redirect('admin_login')  # Redirigez vers la page de connexion




# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json


@login_required 
@csrf_exempt
@require_http_methods(["POST"])
def add_component(request):
    print("=== Début add_component ===")
    print("Méthode:", request.method)
    print("Headers:", request.headers)
    print("Body:", request.body)
    
    try:
        if not request.body:
            return JsonResponse({'error': 'Corps de requête vide'}, status=400)
            
        data = json.loads(request.body)
        print("Données JSON décodées:", data)
        
        name = data.get('name')
        if not name:
            return JsonResponse({'error': 'Le nom est requis'}, status=400)
            
        parent_id = data.get('parent_id')
        print(f"Création composant: nom={name}, parent_id={parent_id}")
        
        try:
            if parent_id:
                parent = Component.objects.get(id=parent_id)
                component = Component.objects.create(name=name, parent=parent)
            else:
                component = Component.objects.create(name=name)
                
            response_data = {
                'id': component.id,
                'name': component.name,
                'parent_id': component.parent.id if component.parent else None
            }
            print("Composant créé avec succès:", response_data)
            return JsonResponse(response_data)
            
        except Component.DoesNotExist:
            return JsonResponse({'error': f'Parent avec id={parent_id} non trouvé'}, status=404)
        except Exception as e:
            print("Erreur lors de la création:", str(e))
            return JsonResponse({'error': str(e)}, status=500)
            
    except json.JSONDecodeError as e:
        print("Erreur décodage JSON:", str(e))
        return JsonResponse({'error': f'JSON invalide: {str(e)}'}, status=400)
    except Exception as e:
        print("Erreur générale:", str(e))
        return JsonResponse({'error': str(e)}, status=500)
    
    
@csrf_exempt
@require_http_methods(["POST"])
@login_required 
def edit_component(request, component_id):
    try:
        data = json.loads(request.body)
        component = Component.objects.get(id=component_id)
        component.name = data.get('name')
        component.save()
        return JsonResponse({'success': True})
    except Component.DoesNotExist:
        return JsonResponse({'error': 'Component not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_component(request, component_id):
    try:
        component = Component.objects.get(id=component_id)
        component.delete()
        return JsonResponse({'success': True})
    except Component.DoesNotExist:
        return JsonResponse({'error': 'Component not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def home_view(request):
    root_components = Component.objects.filter(parent=None)
    users = technician_user.objects.all()
    return render(request, "admin_page/home.html", {
        "components": root_components,
        "users": users
    })


def component_details_view(request, component_id):
    component = get_object_or_404(Component, id=component_id)
    details = Component_details_technique.objects.filter(component=component)
    paragraphes = Component_description_technique_paragraphe.objects.filter(component=component).order_by('order')
    model3d = Component_model3D.objects.filter(component=component).first()
    videos = Component_video.objects.filter(component=component)
    documents = Component_document.objects.filter(component=component)
    
    context = {
        'component': component,
        'details': details,
        'paragraphes': paragraphes,
        'model3d': model3d,
        'videos': videos,
        'documents': documents,
    }
    
    return render(request, 'admin_page/component_details.html', context)


from django.db.models import Max  # Ajoutez cet import en haut

@csrf_exempt
@require_http_methods(["POST"])
def add_paragraph(request):
    print("Réception d'une requête pour add_paragraph")  # Debug log
    try:
        data = json.loads(request.body)
        print("Données reçues:", data)  # Debug log
        
        component_id = data.get('component_id')
        description = data.get('description')
        
        if not all([component_id, description]):
            print("Données manquantes")  # Debug log
            return JsonResponse({'error': 'component_id et description sont requis'}, status=400)
            
        component = Component.objects.get(id=component_id)
        
        # Obtenir le dernier ordre
        last_order = Component_description_technique_paragraphe.objects.filter(
            component=component
        ).aggregate(Max('order'))['order__max'] or 0
        
        paragraph = Component_description_technique_paragraphe.objects.create(
            component=component,
            description=description,
            order=last_order + 1
        )
        
        print("Paragraphe créé avec succès:", paragraph.id)  # Debug log
        return JsonResponse({
            'id': paragraph.id,
            'description': paragraph.description
        })
    except Component.DoesNotExist:
        return JsonResponse({'error': 'Composant non trouvé'}, status=404)
    except Exception as e:
        print("Erreur:", str(e))  # Debug log
        return JsonResponse({'error': str(e)}, status=400)



@csrf_exempt
@require_http_methods(["POST"])
def edit_paragraph(request, paragraph_id):
    try:
        data = json.loads(request.body)
        paragraph = Component_description_technique_paragraphe.objects.get(id=paragraph_id)
        paragraph.description = data.get('description')
        paragraph.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def add_image_to_paragraph(request, paragraph_id):
    try:
        image = request.FILES.get('image')
        paragraph = get_object_or_404(Component_description_technique_paragraphe, id=paragraph_id)
        
        img = paragraphe_images.objects.create(
            paragraphe=paragraph,
            image=image
        )
        
        return JsonResponse({
            'id': img.id,
            'url': img.image.url
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_paragraph(request, paragraph_id):
    try:
        paragraph = get_object_or_404(Component_description_technique_paragraphe, id=paragraph_id)
        paragraph.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def add_technical_detail(request):
    try:
        data = json.loads(request.body)
        component_id = data.get('component_id')
        caractéristique = data.get('caractéristique')
        valeur = data.get('valeur')
        
        component = get_object_or_404(Component, id=component_id)
        detail = Component_details_technique.objects.create(
            component=component,
            caractéristique=caractéristique,
            valeur=valeur
        )
        
        # Retourner les données nécessaires pour créer la ligne dans le tableau
        return JsonResponse({
            'id': detail.id,
            'caractéristique': detail.caractéristique,
            'valeur': detail.valeur
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def edit_technical_detail(request, detail_id):
    try:
        data = json.loads(request.body)
        detail = get_object_or_404(Component_details_technique, id=detail_id)
        if 'caractéristique' in data:
            detail.caractéristique = data['caractéristique']
        if 'valeur' in data:
            detail.valeur = data['valeur']
        detail.save()
        return JsonResponse({
            'id': detail.id,
            'caractéristique': detail.caractéristique,
            'valeur': detail.valeur
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_technical_detail(request, detail_id):
    try:
        detail = get_object_or_404(Component_details_technique, id=detail_id)
        detail.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_document(request, document_id):
    try:
        document = get_object_or_404(Component_document, id=document_id)
        document.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_video(request, video_id):
    try:
        video = get_object_or_404(Component_video, id=video_id)
        video.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def upload_3d_model(request):
    try:
        model3d_file = request.FILES.get('model3D')
        component_id = request.POST.get('component_id')
        
        if not all([model3d_file, component_id]):
            return JsonResponse({'error': 'Fichier et ID du composant requis'}, status=400)
            
        component = get_object_or_404(Component, id=component_id)
        
        # Supprimer l'ancien modèle s'il existe
        Component_model3D.objects.filter(component=component).delete()
        
        model3d = Component_model3D.objects.create(
            component=component,
            model3D=model3d_file
        )
        
        return JsonResponse({
            'id': model3d.id,
            'filename': model3d.model3D.name
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def upload_document(request):
    try:
        doc_file = request.FILES.get('document')
        component_id = request.POST.get('component_id')
        
        component = get_object_or_404(Component, id=component_id)
        document = Component_document.objects.create(
            component=component,
            document=doc_file
        )
        
        return JsonResponse({
            'id': document.id,
            'filename': document.document.name,
            'url': document.document.url,
            'type': doc_file.content_type
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def upload_video(request):
    try:
        video_file = request.FILES.get('video')
        component_id = request.POST.get('component_id')
        
        if not all([video_file, component_id]):
            return JsonResponse({'error': 'Vidéo et ID du composant requis'}, status=400)
            
        component = get_object_or_404(Component, id=component_id)
        video = Component_video.objects.create(
            component=component,
            video=video_file
        )
        
        return JsonResponse({
            'id': video.id,
            'url': video.video.url
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)



# admin_page/views.py
from technician_page.models import technician_user  # Ajoutez cette importation

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def add_user(request):
    try:
        data = json.loads(request.body)
        nom_prenom = data.get('nom_prenom')
        email = data.get('email')
        password = data.get('password')
        
        if not all([nom_prenom, email, password]):
            return JsonResponse({'error': 'Tous les champs sont requis'}, status=400)
        
        # Vérifier si l'email existe déjà
        if technician_user.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Cet email existe déjà'}, status=400)
            
        user = technician_user.objects.create(
            nom_prenom=nom_prenom,
            email=email,
            password=password  # Note: Dans un vrai projet, il faudrait hasher le mot de passe
        )
        
        return JsonResponse({
            'id': user.id,
            'nom_prenom': user.nom_prenom,
            'email': user.email
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def edit_user(request, user_id):
    try:
        data = json.loads(request.body)
        user = technician_user.objects.get(id=user_id)
        
        if 'nom_prenom' in data:
            user.nom_prenom = data['nom_prenom']
        if 'email' in data:
            if technician_user.objects.exclude(id=user_id).filter(email=data['email']).exists():
                return JsonResponse({'error': 'Cet email existe déjà'}, status=400)
            user.email = data['email']
        if 'password' in data:
            user.password = data['password']
            
        user.save()
        return JsonResponse({'success': True})
    except technician_user.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_user(request, user_id):
    try:
        user = technician_user.objects.get(id=user_id)
        user.delete()
        return JsonResponse({'success': True})
    except technician_user.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def get_users(request):
    users = technician_user.objects.all()
    return JsonResponse({
        'users': list(users.values('id', 'nom_prenom', 'email'))
    })