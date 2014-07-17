


$(function(){
    Event = Backbone.Model.extend();//το event εδω πρέπει να είναι object που να σχετίζεται με το FullCalendar

    var Events = Backbone.Collection.extend({
        model: Event,
        url: 'events.php',
}); 
 
    var EventsView = Backbone.View.extend({//με αυτό το view παράγεται το calendar
        initialize: function(){
                _.bindAll(this); 
  
            this.collection.bind('reset', this.addAll);//αυτά φαίνεται οτι ειναι built-in backbone events
            this.collection.bind('add', this.addOne);
            this.collection.bind('change', this.change);            
            this.collection.bind('destroy', this.destroy);
            
            this.eventView = new EventView(); //αυτό είναι view σχετιζόμενο με το dialog box...initialize           
        },
        render: function() {
            this.el.fullCalendar({
                header: {
                    left: 'prev,next ',
                    center: 'title',
                    right: 'today,month,agendaWeek,agendaDay'
                  },
                monthNames:['Ιανουάριος', 'Φλεβάρης', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος','Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'],
                monthNamesShort:['Γεν', 'Φλεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
                dayNames:['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
                dayNamesShort:['Κυρ', 'Δευτ', 'Τρι', 'Τετ', 'Πέμ', 'Παρ', 'Σάββ'],
                buttonText:{day:'ημέρα', week:'εβδομάδα',month:'μήνας',today:'σήμερα'},
                selectHelper: true,
                timeFormat: 'H:mm { - H:mm}' ,
                axisFormat: 'H:mm',
                allDaySlot:false,
                minTime:"06:00:00",
                selectable: true,
                editable: true,
                ignoreTimezone: true,    
                select: this.select,
                eventClick: this.eventClick,
                eventDrop: this.eventDropOrResize,        
                eventResize: this.eventDropOrResize
              
    });
        },
        select: function(start, end,allDay) {
    //ακολουεί ο κώδικας που ελέγχει αν οταν ο χρήστης κλικάρει ένα timeslot υπάρχει ήδη κάποιο event καταχωρημένο 
    //ωστέ να αποφευχθεί η τιμή που θα πάρει το καινούργιο event(σαν start)να είναι ίδια με ενός υφιστάμενου
        
          if ($(".fc-cell-overlay")[0]){

           }//να έχω υπόψη...μερικές φορές...η επιλογή timeslots στην εβδομάδα δεν πιάνει...βγαίνει σφάλμα:[option=value=...]
           else
           {  

           }
          this.eventView.collection = this.collection;
         //this.eventView.model = new Event({start: 1403690400, end: 1403692200,color: '#0072C6'});//αυτά εδώ είναι που τυπώνονται στο calendar μόλις γίνεται επιλογή
        //TO PROBLHMA ΤΗΣ ΜΗ ΑΠΕΙΚΟΝΙΣΗΣ ΟΦΕΙΛΕΤΑΙ ΣΤΟ ΟΤΙ ΥΠΆΡΧΕΙ ΣΥΓΚΡΟΥΣΗ ΜΕΤΑΞΥ ΤΩΝ ΕΠΙΛ. ΩΡΩΝ ΚΑΙ ΑΥΤΩΝ ΠΟΥ ΤΕΛΙΚΑΚ ΠΕΡΝΑΝΕ ΣΤΟ MODEL
           this.eventView.model = new Event({start: Math.round(start.getTime()/ 1000), end: Math.round(end.getTime()/ 1000),allDay: allDay,color: '#0072C6'});//Model inmstance created.. αυτά εδώ τυπώνονται στο calendar...
           var unixstart=Math.round(start.getTime()/ 1000);
           var unixend=Math.round(end.getTime()/ 1000);

           this.eventView.dropfrom(unixstart);
           this.eventView.droptill(unixend);
           this.eventView.render();//με αυτό εδώ βγαίνει το dialog box 
        
           
    },
        addOne: function(event) {
            this.el.fullCalendar('renderEvent', event.toJSON(),true);
           
         
        }, 
        addAll: function() {
            this.el.fullCalendar('addEventSource', this.collection.toJSON());
        },
        eventClick: function(fcEvent,ev) {//αυτό ενεργοπείται οταν κάνω κλικ σε ενα event 
        var unixstart=Math.round(fcEvent.start.getTime()/ 1000);
        var unixend=Math.round(fcEvent.end.getTime()/ 1000);
        this.eventView.dropfrom(unixstart);
        this.eventView.droptill(unixend);
        this.eventView.model = this.collection.get(fcEvent.id);
        this.eventView.render();
       
            
        },
        change: function(event) {//αυτη η function χρησξμευει ωστε όταν πάμε να κάνουμε update ενα event τα καινούργια στοιχεία να απεικονιστούν στο calendar
            // Look up the underlying event in the calendar and update its details from the model
            var fcEvent = this.el.fullCalendar('clientEvents', event.get('id'))[0];
            fcEvent.title = event.get('title');
            fcEvent.color = event.get('color');
            this.el.fullCalendar('updateEvent', fcEvent);           
        },
        eventDropOrResize: function(fcEvent) {
            // Lookup the model that has the ID of the event and update its attributes
            this.collection.get(fcEvent.id).save({start: fcEvent.start, end: fcEvent.end});//αυτό ενεργοπιιείται όταν πάω να κάνω drag ένα event και να του αλλάξω την ημερομηνία π.χ             
        },
        destroy: function(event,start,end) {
            this.el.fullCalendar('removeEvents', event.id);           
        }        
    });
    
    var EventView = Backbone.View.extend({//με αυτό το view παράγεται το dialog box οπου ο χρήσητης θα κρατα τις λεπτομέρεις των ραντεβού
        selestrt: null,
        selesttill: null,
        
        el: $('#eventDialog'),
        events: {"change #timesfrom": "changefrom",
                 "change #timestill":"changetill"        
        },
        initialize: function() {
            _.bindAll(this);//να μάθω ποια η χρησιμότητα αυτού  
       
            },
        render: function() {
            
            var buttons = {'Ok': this.save};//αυτό εδώ σημαίνει οτι με το πάτημα του ΟΚ καλείται η save function που είναι αμέσως από κάτω
            if (!this.model.isNew()) {//μηπως πρεπει να γίνεται fetch/get για να μην εμφανίζεται το σφάλμα isNew
                _.extend(buttons, {'Διαγραφή': this.destroy});
            }
            _.extend(buttons, {'Ακύρωση': this.close});            
            this.el.dialog({//αυτό παράγεται από το dialog UI του jquery UI
                modal: true,
                title: (this.model.isNew() ? 'Νέο ' : 'Επεξεργασία') + ' Ραντεβού',
                buttons: buttons,
                open: this.open,//με αυτό ανοίγει το dialog box
                width: 500,
                close: function( event, ui ) 
                {
                $('#services').val('').trigger('chosen:updated');
                }
            
            });

            return this;
        },    
        dropfrom:function(selestrt,changest)
        {  
           this.selestrt=selestrt;//global
      
           var jstime=selestrt*1000;
           var j=new Date(jstime);
           var startmilli=j.setHours(5,0), endmilli=j.setHours(23,0);//εδω τίθτεται το εύρος επιλογής ωρων...6πμ-23μμ
           var start=startmilli/1000, end=endmilli/1000;
          //να μάθω εδώ για τις επιπλοκές να διαγράφεται το περιεχόμενο από μια άλλη ίδιου ονόματος
           $('#timesfrom').find('option').remove();
           if(changest==='true')
            {   
            while(start<end)
            {start+=1800;
              var depctime=start*1000,k=new Date(depctime),hour=k.getHours(), minutes=k.getMinutes();
              var adjminuts = (minutes === 0) ? '00' : minutes;  
         
              $('#timesfrom').append("<option value='" + start + "'>"+ hour+':'+ adjminuts + "</option>");
              $('#timesfrom').val(this.selestrt);
            }
               $('#timesfrom').addClass('tslothighlight').toggle( "highlight" );
            }
            else{
            while(start<end)
            {start+=1800;
              var depctime=start*1000,k=new Date(depctime),hour=k.getHours(), minutes=k.getMinutes();
              var adjminuts = (minutes === 0) ? '00' : minutes;  
         
              $('#timesfrom').append("<option value='" + start + "'>"+ hour+':'+ adjminuts + "</option>");
              $('#timesfrom').val(selestrt);
            }
            }
               
        },
        droptill:function(selctend,changetl)
        {
         this.selesttill=selctend;
         var jstime=selctend*1000;
         var j=new Date(jstime);
         
         var startmilli=j.setHours(5,0),endmilli=j.setHours(23,0);
         var start=startmilli/1000,end=endmilli/1000;
         $('#timestill').find('option').remove();
         if(changetl==='true')
         {
                 while(start<end){
                start+=1800;
                 var depctime=start*1000,k=new Date(depctime),hour=k.getHours(), minutes=k.getMinutes(),
                 adjminuts = (minutes === 0) ? '00' : minutes;
                 $('#timestill').append("<option value='" + start + "'>"+ hour+':'+ adjminuts + "</option>");
                 $('#timestill').val(this.selesttill); 
               }  
         }
         else{
            while(start<end){
                start+=1800;
                 var depctime=start*1000,k=new Date(depctime),hour=k.getHours(), minutes=k.getMinutes(),
                 adjminuts = (minutes === 0) ? '00' : minutes;
                 $('#timestill').append("<option value='" + start + "'>"+ hour+':'+ adjminuts + "</option>");
                 $('#timestill').val(selctend); 
               }
       }
        },
        changefrom:function(){
         this.selestrt;

             $("#timesfrom option:selected").each(function () {
                  
                  var selstart=$('#timesfrom').val();
                  var selectedtill=$('#timestill').val();
                  if(selstart>=selectedtill)
                  {
                  alert('Ουπς...η ώρα που ξεκινάει ένα ραντεβού δεν μπορεί να είναι πιο μπροστά από την ώρω που λήγει')
                   this.dropfrom(this.selestrt,'true');//κλήση του  μενού εδώ...ετσι όπως ειναι ο κωδικας ομως στο drop menu 
                    return false;                            //θα απεικονίζεται πάλι νέα επιλεχθεία τιμή και όχι η παλιά που θέλω
                 
                  }
                  var end=this.model.get('end');//unix timestamp
                  var unixstartmili=selstart*1000,unixendmili=end*1000;
                  var start=new Date(unixstartmili),end=new Date(unixendmili);
                  var allDay = false;
                  $('#calendar').fullCalendar('select',start,end,allDay);//το πρόβλημα είναι οτι αυτό 
                  }.bind(this));
         
                },
        changetill:function()
        {  this.selesttill;
            
                   
            $("#timestill option:selected" ).each(function() {
                   var selstart=$('#timesfrom').val();
                   var selectedtill=$('#timestill').val();
                   if(selectedtill<=selstart)
                   {
                  alert('Ουπς...η ώρα που λήγει ένα  ραντεβού δεν μπορεί να είναι πιο μπροστά από την ώρω που ξεκινά')
                  this.droptill(this.selesttill,'true');//κλήση του  μενού εδώ...ετσι όπως ειναι ο κωδικας ομως στο drop menu 
                    return false;       
                   }
                   
                   var start=this.model.get('start');
                   var unixstartmili=start*1000;
                   var unixendmili=selectedtill*1000;
                
                   var start=new Date(unixstartmili);
                   var end=new Date(unixendmili);
                   var allDay = false;
                 $('#calendar').fullCalendar('select',start,end,allDay);
                 }.bind(this));//να μάθω για το bind this
        },
     
        save: function() {
          if ($.trim((this.$('#name').val()))==='')
             {alert('δεν έχεις βάλει κάποιο όνομα');
            return false; 
            }
          if ($.trim((this.$(".chosen-select").val()))==='')
             {alert('δεν έχεις επιλέξει υπηρεσία');
                return false; 
             }  
            this.model.set({'title': this.$('#name').val(),'origin':this.$('#origin').val(),'staff':this.$("#staff").val(),'services':this.$(".chosen-select").val()});//αυτά χρησιμοποιούνται στο POST
            if (this.model.isNew()) {                                                                                                            
                    this.collection.create(this.model, {success: this.close});//αποθήκευση δεδομένων στην βάση....με το close εδω κανονικά θα έπρεπε να κελινει το dialog...κάτι που δεν γίνεται όμως
   
            } else {//το success στην παραπάνω γραμμή πρέπει να περιμένει απάντηση σπό server ώστε να κλείσει το dialog box
               this.model.save({}, {success: this.close});
                }
         },
        open: function() {//θα πρέπει να μπει κώδικας εδώ που να τίθενται όλες οι προεπιλεγμένες τιμές...ενός υπάρχοντος/υπο επεξεργασία ραντεβού
           this.$('#name').val(this.model.get('title'));//με αυτό εμφανίζεται το όνομα αυτουνού που έχει κλεισει το ραντεβού
           if (!this.model.isNew())
             {this.$('#services').val([ "1", "2" ]).trigger("chosen:updated");
            this.$('#staff').val(this.model.get('staff_ID'));
            }
          
           //this.$('#color').val(this.model.get('color'));   
        },   
        close: function() {//αυτή η function καλείται όταν πάτάω το κουμπί ακύρωσης
           this.el.dialog('close');//με αυτό εδώ κλείνει το dialog box
          
        },
        destroy: function() {
            this.model.destroy({success: this.close});
        }
      
  });
     
    var events = new Events();//το Events εδώ είναι collection...collection of models always
    
    new EventsView({el: $("#calendar"), collection: events}).render();//με αυτό εδώ παράγεται  το calendar...
                        //αφου καλείται η render function του EventsView = Backbone.View.extend...κάνουμε initialize το view δηλαδή                                                                     //με τα events

    events.fetch([{'service':'service'}]);//με αυτό εδώ παίρνουμε τα events από την βάση και τα απεικονίζουμε στο calendar...με την μορφή json...GET request
    
    //το eve είναι το collection εδώ....τα αποτελέσματα του οποίου απεικονίζονται στην αμέσως παραπάνων γραμμή κώδικα
          
//    
//           $(".fc-day").click(function(){
//         
////           $('#calendar').fullCalendar( 'changeView', agendaWeek );
//      }); 
//        
  
});


  
