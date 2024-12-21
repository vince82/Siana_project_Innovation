from django.urls import path
from . import views
urlpatterns = [
    path('',views.login_view,name='admin_login'),
    path('logout/',views.logout_view,name='admin_logout'),
    path('home/',views.home_view,name='admin_home')
]