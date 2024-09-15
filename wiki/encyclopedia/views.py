from django.shortcuts import render,redirect
from django.http import HttpRequest,HttpResponse
from django.utils.safestring import mark_safe
import random as rd


from . import util
from django import forms

class MyForm(forms.Form):
    title=forms.CharField(label="title",required=True)
    content = forms.CharField(
        widget=forms.Textarea(attrs={
            'rows': 10,
            'cols': 30,
            'placeholder': 'Enter your text here...'
            
        }),
        label='body',
        required=True
    )



def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })
def entry(request,name):
    entries=util.list_entries()
    if(len(entries)>0):
        if name in entries:
            md_text=util.get_entry(name)
            context={'title':name, "html":mark_safe(util.htmlify(md_text))}
            return render(request,f"encyclopedia/entries.html",context)
            #return HttpResponse("hello")
        else:
            context={'title':"not found",'html':f"nothing on {name} yet..you can create one if u want to :)"}
            return render(request,"encyclopedia/entries.html",context)
    else:
        return HttpResponse("error 404 ")
def edit(request,name):
    if request.method == 'POST':
        # Retrieve the user input from the form
        user_input = request.POST.get('user_input', '')
        util.save_entry(name,user_input)
        return redirect('entry', name=name)
    else:
        md_text=util.get_entry(name)
        context={'title':name,'md_text': md_text}
        return render(request,"encyclopedia/edit.html",context)

def search(request):
    if request.method =='GET':
        name=request.GET.get('q','')
        entries=util.list_entries()
        if name in entries:
            return redirect('entry', name=name)
        else:
            found=[]
            for entry in entries:
                if name.lower() in entry.lower():
                    found.append(entry)
            context={'found':found}
            return render(request,"encyclopedia/search.html",context)
        
def createpage(request):
    if request.method=='POST':
        form=MyForm(request.POST)
        if form.is_valid():
            title=form.cleaned_data['title']
            content=form.cleaned_data['content']
            if title in util.list_entries():
                context={'status':"title already exists..choose a different one",'form':form}
                return render(request,"encyclopedia/newpage.html",context)
            else:
                util.save_entry(title,content)
                return redirect('entry',name=title)
        else:
            context={'status':"invalid submission",'form':form }
            return render(request,"encyclopedia/newpage.html",context)
    else:
         context={'status':"dont forget to save after writing",'form':MyForm()}
         return render(request,"encyclopedia/newpage.html",context)
    
def random(request):
    entries=util.list_entries()
    title= rd.choice(entries)
    md_text=util.get_entry(title)
    context={'title':title, "html":mark_safe(util.htmlify(md_text))}
    return render(request,f"encyclopedia/entries.html",context)
