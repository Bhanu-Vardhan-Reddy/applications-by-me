document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click',() => compose_email(null));

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email(email) {
   
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  if(email){
    bits=email.subject.charAt(0)+email.subject.charAt(1)+email.subject.charAt(2)
    if("Re:"===bits){
      sub=  email.subject
    }
    else{
      sub=`Re: ${email.subject}`
    }
    
  document.querySelector('#compose-recipients').value = email.sender||'';
  document.querySelector('#compose-subject').value =sub ||'';
  document.querySelector('#compose-body').value =` On ${email.timestamp} ${email.sender} wrote: \n${email.body}\n`||'';
  }
  else{
    
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value ='';
  document.querySelector('#compose-body').value ='';

  }


}

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  console.log("loading mailbox: "+mailbox)
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
 
  fetch(`/emails/${mailbox}`,{method:'GET'})
  .then(response => response.json())
  .then(emails => 
    {
      // Print emails
      console.log('the emails are arrays : '+Array.isArray(emails));

      emails.forEach(element =>
      {
        console.log("loopin through element.read: "+element.read);
        if(element.read)
        {
          x="visited";
        }
        else
        {
          x='notvisited';
        }
        console.log(x);
        if(element.archived===false)
        {
          console.log("INSIDE NON ARCHIVED MAILBOX")
          console.log("this is email sender"+element.sender)
          
          if(element.sender==='{{request.user.email}}')
          {
            console.log("these are recevers: "+element.recipients);
            details=`TO: ${element.recipients[0]}`;
          }
          else
          {
            console.log("these are recevers: "+element.recipients);
            details=element.sender.trim();
          }
          document.querySelector('#emails-view').innerHTML+=`
          <div class="emailunit  ${x}" data-element-id="${element.id}">
          <div>${details}</div>    
          <div style="margin-left: 50px;">${element.subject.trim()}</div>
          <div style="margin-left: auto;">${element.timestamp.trim()}</div>
          </div>
          `;
        }
        else
        {
          console.log("inside archived")
          if(mailbox==="archive")
          {
            if(element.sender==='{{request.user.email}}')
              {
                console.log("these are recevers: "+element.recipients);
                details=`TO: ${element.recipients[0]}`;
              }
              else
              {
                console.log("these are recevers: "+element.recipients);
                details=element.sender.trim();
              }
              document.querySelector('#emails-view').innerHTML+=`
              <div class="emailunit  ${x}" data-element-id="${element.id}">
              <div>${details}</div>    
              <div style="margin-left: 50px;">${element.subject.trim()}</div>
              <div style="margin-left: auto;">${element.timestamp.trim()}</div>
              </div>
              `;
          }
          
          
        }
        } );
        console.log("mailbox html generated")
      
      elements=document.querySelectorAll('.emailunit');
        elements.forEach((elementi) => 
        {
          console.log("this is retrieved element: "+elementi.innerHTML); 
          elementi.addEventListener("click",()=>
            {
              elementid=elementi.dataset.elementId
              console.log(elementid+"clicked");
              //need to view and put  read=>true
              fetch(`/emails/${elementid}`, 
                {
                  method: 'PUT',
                  body: JSON.stringify(
                    {
                      archived: false,
                      read:true, 
                    })
                });
                email_view(elementid);
              
            }) 
        });
      console.log("made read dynamic");

    });
}
async function email_view(elementid) {
  console.log("THE EMAIL VIEW LOADED")
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  console.log("THE email is being loaded")
  fetch(`/emails/${elementid}`)
  .then(response => response.json())
  .then(email => 
    {
      console.log(email)
      console.log("fetch response is: "+email+"this is just a copy wont change until the function is reloaded");
      recipients=email.recipients;
      console.log("recipients are : "+recipients);
      if((recipients.length)!=1)
      {
        console.log("into the multiple recepients section")
        html1='';
        recipients.forEach((recipient)=>
        {
        html1+=`<div class="receiver">${recipient}</div>`
        })
        
      }
      else
      {
        console.log("into single recepient section")
         html1=`<div class="reveiver">${email.recipients}</div>`
      }

      if(email.archived)
      { 
        console.log("the email is currently archived")
        but="Unarchive"
      }
      else
      {
        console.log("the email is currently Unarchived")
        but="Archive"
      }
      console.log("loading emailview html")
      console.log("CHECKING FOR SENDER")
      console.log("this is sender: "+email.sender+"\n this is user: "+email.user)
      if(email.sender==email.user)
        {
          console.log("THIS IS SENT")
            document.querySelector('#email-view').innerHTML=`
          <div class="email">
          <div clss="sender">
          By: ${email.sender} at: ${email.timestamp}
          </div>
          <div class="receipients">receipients: 
          ${html1}
          </div>
          <div class="subject">subject: ${email.subject}</div>
          <div class="body">body: ${email.body}</div>
          <div>
          <button class='reply'>reply</button>  
          </div>
          </div>
          `;

        }
      else
      {
        console.log("THIS IS NOT SENT")
          document.querySelector('#email-view').innerHTML=`
          <div class="email">
          <div clss="sender">
          By: ${email.sender} at: ${email.timestamp}
          </div>
          <div class="receipients">receipients: 
          ${html1}
          </div>
          <div class="subject">subject: ${email.subject}</div>
          <div class="body">body: ${email.body}</div>
          <div>
          <button class='button'>${but}</button>
          <button class='reply'>reply</button>  
          </div>
          </div>
          `;
          document.querySelector(".button").addEventListener('click',()=>{
            console.log("adding event listener to button")
            if(email.sender!=email.user)
              {
                console.log("inside non-sent emails")
                if(!email.archived)
                {
                  console.log("inside non archived emails")
                  console.log("the email id is : "+email.id)
                  console.log("this id is legit"+typeof(email.id))
                  console.log("fetching put for archiving")
                  fetch(`/emails/${email.id}`,
                  {
                    method: 'PUT',
                    body: JSON.stringify(
                      {
                        archived: true,
                      })
                  })
                  .then(response=>
                  {
                    if (!response.ok)
                    {
                      throw new Error('Network response was not ok');
                    }
                    console.log(response)
                    console.log("making email copy get archived ")
                    email.archived=true;
                    console.log("is it archived "+email.archived)
                    document.querySelector('.button').innerHTML="Unarchive";
                  }).catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                  });
                }
                else
                {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  });
                  document.querySelector('.button').innerHTML="Archive";
                }
              }
          });
      }
      console.log("emailview html loaded")
     
      document.querySelector(".reply").addEventListener('click',()=>{
        compose_email(email);
      })
      
    });
 

}
async function sendemail() {
  const r = document.getElementById('compose-recipients').value;
  const s = document.getElementById('compose-subject').value;
  const b = document.getElementById('compose-body').value;
  console.log(r,s,b);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: r,
        subject: s,
        body: b,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
      
  });
}

