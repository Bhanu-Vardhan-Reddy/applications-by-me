from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:name>",views.entry,name="entry"),
    path("wiki/<str:name>/edit",views.edit,name='edit'),
    path("wiki/search/",views.search,name='search'),
    path("wiki/createpage/",views.createpage,name='createpage'),
    path("wiki/random/",views.random,name='random')

]
